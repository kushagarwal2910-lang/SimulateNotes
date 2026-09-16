import os
import re
import json
import logging
from typing import List, Dict, Any, Optional
import requests
from urllib.parse import urlparse

from .config import TAVILY_API_KEY, MIN_DOCUMENTS, TARGET_DOCUMENTS, MAX_DOCUMENTS

logger = logging.getLogger("rag_spec_agent.tavily")

def normalize_url(url: str) -> str:
    """Normalizes a URL by stripping tracking params and trailing slashes for deduplication."""
    if not url:
        return ""
    try:
        parsed = urlparse(url)
        clean = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
        return clean.lower()
    except Exception:
        return url.strip().lower()

def clean_text_content(text: str) -> str:
    """Cleans extracted document text, stripping heavy whitespace and junk scripts."""
    if not text:
        return ""
    # Remove script and style tags if raw HTML leaked in
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    # Collapse multiple blank lines and tabs
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()

def generate_sub_queries(topic: str) -> List[str]:
    """
    Generates 4 complementary, highly targeted search sub-queries
    to ensure multi-angle coverage across scientific principles, math,
    visual architecture, and real-world parameters.
    """
    clean_topic = topic.strip()
    return [
        f"{clean_topic} fundamental principles governing laws physical mechanism",
        f"{clean_topic} mathematical equations formulas variables constants units derivation",
        f"{clean_topic} visual diagram spatial structure schematic experimental setup",
        f"{clean_topic} interactive simulation parameters pedagogical explanation milestones"
    ]

def fetch_documents_with_tavily(
    topic: str,
    api_key: Optional[str] = None,
    target_count: int = TARGET_DOCUMENTS
) -> List[Dict[str, Any]]:
    """
    Executes deep web research using Tavily Search API.
    Performs multi-query search to crawl, deduplicate, and assemble
    25-30 rich, authoritative documents with full content.
    """
    key = api_key or TAVILY_API_KEY or os.getenv("TAVILY_API_KEY", "").strip()
    if not key:
        raise ValueError(
            "Tavily API Key not found! Please provide your Tavily API key via:\n"
            "  1. .env file: TAVILY_API_KEY=tvly-...\n"
            "  2. CLI argument: --tavily-key tvly-...\n"
            "  3. Interactive prompt when running the agent."
        )

    queries = generate_sub_queries(topic)
    collected_docs: List[Dict[str, Any]] = []
    seen_urls = set()

    headers = {
        "Content-Type": "application/json"
    }
    tavily_endpoint = "https://api.tavily.com/search"

    # We distribute the target count across the 4 diverse sub-queries (approx 7-8 per query)
    results_per_query = max(8, (target_count // len(queries)) + 2)

    # Execute the 4 diverse sub-queries concurrently using ThreadPoolExecutor for rapid crawling
    from concurrent.futures import ThreadPoolExecutor, as_completed

    def fetch_single_query(sub_q: str):
        payload = {
            "api_key": key,
            "query": sub_q,
            "search_depth": "advanced",
            "include_raw_content": True,
            "include_answer": False,
            "max_results": results_per_query
        }
        try:
            resp = requests.post(tavily_endpoint, json=payload, headers=headers, timeout=25)
            if resp.status_code == 401:
                raise ValueError(f"Tavily API rejected the API key (401 Unauthorized): {resp.text}")
            resp.raise_for_status()
            return sub_q, resp.json().get("results", [])
        except Exception as e:
            logger.warning(f"Error querying Tavily for '{sub_q}': {e}")
            return sub_q, []

    with ThreadPoolExecutor(max_workers=min(len(queries), 4)) as executor:
        future_to_query = [executor.submit(fetch_single_query, q) for q in queries]
        for future in as_completed(future_to_query):
            sub_q, results = future.result()
            for item in results:
                raw_url = item.get("url", "")
                norm_url = normalize_url(raw_url)
                if not norm_url or norm_url in seen_urls:
                    continue

                seen_urls.add(norm_url)
                
                # Extract text content: prefer raw_content, fallback to content
                raw_body = item.get("raw_content") or item.get("content") or ""
                cleaned = clean_text_content(raw_body)
                
                # Filter out empty or trivially short stub pages (< 120 chars)
                if len(cleaned) < 120:
                    continue

                title = item.get("title") or f"Document {len(collected_docs) + 1}"
                snippet = clean_text_content(item.get("content") or "")[:400]

                doc = {
                    "id": f"doc_{len(collected_docs) + 1:02d}",
                    "title": title,
                    "url": raw_url,
                    "snippet": snippet,
                    "content": cleaned,
                    "query_source": sub_q,
                    "score": item.get("score", 0.0),
                    "char_count": len(cleaned)
                }
                collected_docs.append(doc)

                if len(collected_docs) >= MAX_DOCUMENTS:
                    break

            if len(collected_docs) >= target_count:
                break

    # If we fell short of 25 documents, make one broader sweep
    if len(collected_docs) < MIN_DOCUMENTS:
        fallback_query = f"{topic} comprehensive guide technical overview"
        try:
            payload = {
                "api_key": key,
                "query": fallback_query,
                "search_depth": "advanced",
                "include_raw_content": True,
                "max_results": (MIN_DOCUMENTS - len(collected_docs)) + 5
            }
            resp = requests.post(tavily_endpoint, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                for item in resp.json().get("results", []):
                    norm_url = normalize_url(item.get("url", ""))
                    if not norm_url or norm_url in seen_urls:
                        continue
                    seen_urls.add(norm_url)
                    raw_body = item.get("raw_content") or item.get("content") or ""
                    cleaned = clean_text_content(raw_body)
                    if len(cleaned) < 120:
                        continue
                    collected_docs.append({
                        "id": f"doc_{len(collected_docs) + 1:02d}",
                        "title": item.get("title", f"Document {len(collected_docs) + 1}"),
                        "url": item.get("url", ""),
                        "snippet": clean_text_content(item.get("content", ""))[:400],
                        "content": cleaned,
                        "query_source": fallback_query,
                        "score": item.get("score", 0.0),
                        "char_count": len(cleaned)
                    })
                    if len(collected_docs) >= MAX_DOCUMENTS:
                        break
        except Exception as e:
            logger.warning(f"Fallback Tavily sweep encountered error: {e}")

    return collected_docs
