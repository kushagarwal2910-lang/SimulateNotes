import os
import re
import math
import pickle
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .config import RAG_CACHE_DIR, CHUNK_SIZE, CHUNK_OVERLAP, TOP_K_RETRIEVAL

class TextChunker:
    """Chunks documents using recursive boundary splitting with overlap."""
    def __init__(self, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str) -> List[str]:
        if not text:
            return []
        
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) + 2 <= self.chunk_size:
                current_chunk = f"{current_chunk}\n\n{para}" if current_chunk else para
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                if len(para) > self.chunk_size:
                    sentences = re.split(r"(?<=[.!?])\s+", para)
                    sub_chunk = ""
                    for s in sentences:
                        if len(sub_chunk) + len(s) + 1 <= self.chunk_size:
                            sub_chunk = f"{sub_chunk} {s}" if sub_chunk else s
                        else:
                            if sub_chunk:
                                chunks.append(sub_chunk)
                            sub_chunk = s
                    if sub_chunk:
                        current_chunk = sub_chunk
                    else:
                        current_chunk = ""
                else:
                    current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

        if len(chunks) <= 1:
            return chunks

        blended = []
        for i, ch in enumerate(chunks):
            if i > 0 and self.chunk_overlap > 0:
                prev_tail = chunks[i-1][-self.chunk_overlap:]
                blended.append(f"...{prev_tail} {ch}")
            else:
                blended.append(ch)

        return blended


class BM25Retriever:
    """Lightweight in-memory BM25 keyword ranker for domain formulas and symbols."""
    def __init__(self, corpus: List[str]):
        self.corpus = corpus
        self.doc_len = [len(doc.split()) for doc in corpus]
        self.avg_len = sum(self.doc_len) / max(1, len(self.doc_len))
        self.df = {}
        self.tf = []
        self._build_index()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"[a-zA-Z0-9_\^\\/=*\-+]+", text.lower())

    def _build_index(self):
        for doc in self.corpus:
            tokens = self._tokenize(doc)
            counts = {}
            for t in tokens:
                counts[t] = counts.get(t, 0) + 1
            self.tf.append(counts)
            for t in counts:
                self.df[t] = self.df.get(t, 0) + 1

    def score(self, query: str, k1: float = 1.5, b: float = 0.75) -> np.ndarray:
        q_tokens = self._tokenize(query)
        scores = np.zeros(len(self.corpus), dtype=np.float32)
        n_docs = len(self.corpus)

        for t in q_tokens:
            if t not in self.df:
                continue
            df_val = self.df[t]
            idf = math.log((n_docs - df_val + 0.5) / (df_val + 0.5) + 1.0)
            for idx, counts in enumerate(self.tf):
                tf_val = counts.get(t, 0)
                if tf_val > 0:
                    numerator = tf_val * (k1 + 1)
                    denominator = tf_val + k1 * (1 - b + b * (self.doc_len[idx] / max(1, self.avg_len)))
                    scores[idx] += idf * (numerator / denominator)

        return scores


class LocalRAGIndex:
    """
    High-speed local hybrid RAG index combining Scikit-Learn TF-IDF vectorization
    and BM25 keyword scoring with source attribution.
    100% self-contained, offline, and executes in milliseconds.
    """
    def __init__(self, index_id: str):
        self.index_id = index_id
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.bm25: Optional[BM25Retriever] = None

    def index_documents(self, documents: List[Dict[str, Any]]) -> int:
        """Chunks documents and generates vector index."""
        chunker = TextChunker()
        all_chunks = []

        for doc in documents:
            doc_id = doc.get("id", "doc")
            title = doc.get("title", "Untitled")
            url = doc.get("url", "")
            content = doc.get("content", "")

            raw_chunks = chunker.split_text(content)
            for c_idx, c_text in enumerate(raw_chunks):
                has_math = bool(re.search(r"(=|\^|\\sum|\\frac|\\sqrt|\\alpha|\\beta|\\gamma|\\hbar|\\pi|\\lambda|\\mu|\\sigma|\\rho|dt|dx|d2)", c_text))
                
                all_chunks.append({
                    "chunk_id": f"{doc_id}_c{c_idx:03d}",
                    "doc_id": doc_id,
                    "title": title,
                    "url": url,
                    "text": c_text,
                    "has_math": has_math,
                    "char_count": len(c_text)
                })

        self.chunks = all_chunks
        corpus_texts = [c["text"] for c in all_chunks] if all_chunks else [""]

        # Vectorization via sublinear TF-IDF (1-gram and 2-gram)
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=12000,
            sublinear_tf=True,
            token_pattern=r"(?u)\b[a-zA-Z0-9_\^\\/=*\-+]+\b"
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus_texts)
        self.bm25 = BM25Retriever(corpus_texts)

        return len(self.chunks)

    def query(
        self,
        query_text: str,
        top_k: int = TOP_K_RETRIEVAL,
        dense_weight: float = 0.60
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid search (TF-IDF cosine similarity + BM25 score)
        over indexed document chunks.
        """
        if not self.chunks or self.vectorizer is None or self.tfidf_matrix is None:
            return []

        n_chunks = len(self.chunks)
        
        # 1. Cosine similarity
        q_vec = self.vectorizer.transform([query_text])
        cos_sim = cosine_similarity(q_vec, self.tfidf_matrix)[0]

        # 2. BM25 score
        bm25_scores = np.zeros(n_chunks, dtype=np.float32)
        if self.bm25 is not None:
            raw_bm25 = self.bm25.score(query_text)
            max_bm = np.max(raw_bm25) if np.max(raw_bm25) > 0 else 1.0
            bm25_scores = raw_bm25 / max_bm

        # Normalize cosine similarity
        min_c, max_c = np.min(cos_sim), np.max(cos_sim)
        if max_c > min_c:
            cos_norm = (cos_sim - min_c) / (max_c - min_c)
        else:
            cos_norm = cos_sim

        hybrid_scores = (dense_weight * cos_norm) + ((1.0 - dense_weight) * bm25_scores)
        top_indices = np.argsort(hybrid_scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            chunk_data = dict(self.chunks[idx])
            chunk_data["score"] = float(hybrid_scores[idx])
            results.append(chunk_data)

        return results

    def save(self, filepath: Optional[Path] = None) -> Path:
        """Saves indexed chunks and precomputed vectors to disk cache."""
        path = filepath or (RAG_CACHE_DIR / f"{self.index_id}.pkl")
        with open(path, "wb") as f:
            pickle.dump({
                "index_id": self.index_id,
                "chunks": self.chunks,
                "vectorizer": self.vectorizer,
                "tfidf_matrix": self.tfidf_matrix
            }, f)
        return path

    @classmethod
    def load(cls, filepath: Path) -> "LocalRAGIndex":
        """Loads cached index from disk."""
        with open(filepath, "rb") as f:
            data = pickle.load(f)
        idx = cls(data["index_id"])
        idx.chunks = data["chunks"]
        idx.vectorizer = data.get("vectorizer")
        idx.tfidf_matrix = data.get("tfidf_matrix")
        corpus_texts = [c["text"] for c in idx.chunks]
        idx.bm25 = BM25Retriever(corpus_texts)
        return idx


def build_structured_context(retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    Synthesizes retrieved chunks into a densely structured, clean markdown
    dossier ready to feed into the high-context LLM prompt.
    """
    if not retrieved_chunks:
        return "No relevant context extracted from web documents."

    sections = []
    seen_urls = set()

    for idx, c in enumerate(retrieved_chunks, 1):
        source_title = c.get("title", "Reference")
        source_url = c.get("url", "")
        text = c.get("text", "").strip()
        
        attribution = f"[{idx}] {source_title}"
        if source_url and source_url not in seen_urls:
            attribution += f" ({source_url})"
            seen_urls.add(source_url)

        sections.append(f"### Research Source {attribution}\n{text}")

    return "\n\n".join(sections)
