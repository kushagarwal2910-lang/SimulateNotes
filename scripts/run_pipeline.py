#!/usr/bin/env python
"""
Headless Pipeline Runner: RAG Spec Agent → LangGraph Simulation Agent.

Chains both LangGraph agents end-to-end:
  1. RAG Spec Agent: Tavily search → RAG index → LLM spec synthesis → validation
  2. LangGraph Simulation Agent: Blueprint → Code gen → Babel verify → Export

Usage:
  python scripts/run_pipeline.py --topic "Bayes theorem and conditional probability"
  python scripts/run_pipeline.py --topic "quantum tunneling" --job-id "job_abc123"

Output: JSON result to stdout with simulation paths, metadata, and status.
"""

import sys
import os
import json
import argparse
import time
import traceback
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")


def write_status(job_dir: Path, status: str, step: str = "", detail: str = "", result: dict = None):
    """Write current pipeline status to job directory for polling."""
    status_data = {
        "status": status,
        "step": step,
        "detail": detail,
        "timestamp": time.time(),
    }
    if result:
        status_data["result"] = result
    with open(job_dir / "status.json", "w", encoding="utf-8") as f:
        json.dump(status_data, f, indent=2)


def run_full_pipeline(topic: str, job_id: str = None, notebook_id: str = None):
    """
    Runs the full pipeline: RAG Spec Agent → LangGraph Simulation Agent.
    If notebook_id is provided and its cache exists, searches the already-indexed
    RAG store instead of crawling Tavily again.
    """
    # Set up job tracking directory
    job_id = job_id or f"job_{int(time.time())}"
    job_dir = PROJECT_ROOT / "scratch" / "jobs" / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    write_status(job_dir, "running", "init", f"Starting pipeline for: {topic}")

    try:
        # =====================================================================
        # STAGE 1: RAG Spec Agent — Research + Spec Synthesis
        # =====================================================================
        notebook_cache_file = PROJECT_ROOT / "scratch" / "rag_cache" / f"{notebook_id}.json" if notebook_id else None
        
        cache_data = None
        if notebook_cache_file and notebook_cache_file.exists():
            try:
                with open(notebook_cache_file, "r", encoding="utf-8") as f:
                    raw_content = f.read().strip()
                    if raw_content:
                        cache_data = json.loads(raw_content)
            except Exception as read_err:
                print(f"[Pipeline] Warning reading notebook cache for '{notebook_id}': {read_err}", file=sys.stderr)
                cache_data = None

        chunks = cache_data.get("chunks", []) if isinstance(cache_data, dict) else []
        sources = cache_data.get("sources", []) if isinstance(cache_data, dict) else []
        has_cached_rag = bool(chunks or sources)

        if has_cached_rag:
            write_status(job_dir, "running", "rag_retrieval", f"Using indexed RAG store for notebook: {notebook_id}")
            print(f"[Pipeline] Found existing RAG cache for notebook '{notebook_id}'. Skipping Tavily re-crawl.", file=sys.stderr)

            from rag_spec_agent.rag_engine import LocalRAGIndex, build_structured_context
            from rag_spec_agent.synthesizer import SpecSynthesizer
            from rag_spec_agent.validator import validate_simulation_spec
            from rag_spec_agent.config import SAMPLES_DIR

            if chunks:
                index = LocalRAGIndex(f"nb_{notebook_id}")
                index.chunks = chunks
                corpus_texts = [c["text"] for c in chunks]
                from sklearn.feature_extraction.text import TfidfVectorizer
                from rag_spec_agent.rag_engine import BM25Retriever
                index.vectorizer = TfidfVectorizer(
                    ngram_range=(1, 2),
                    max_features=12000,
                    sublinear_tf=True,
                    token_pattern=r"(?u)\b[a-zA-Z0-9_\^\\/=*\-+]+\b"
                )
                index.tfidf_matrix = index.vectorizer.fit_transform(corpus_texts)
                index.bm25 = BM25Retriever(corpus_texts)
                retrieved = index.query(topic, top_k=12)
            else:
                retrieved = [
                    {"title": s.get("title", "Source"), "url": s.get("url", ""), "text": s.get("snippet", "")}
                    for s in sources
                ]

            structured_context = build_structured_context(retrieved)

            write_status(job_dir, "running", "spec_synthesis", "Agent 1: Synthesizing JSON simulation specification from RAG context...")
            synthesizer = SpecSynthesizer()
            spec, raw_resp = synthesizer.synthesize_spec(topic, topic, structured_context)

            if not spec:
                raise RuntimeError("Failed to synthesize JSON specification from RAG context.")

            write_status(job_dir, "running", "spec_validation", "Validating mathematical formulas and state parameters...")
            report = validate_simulation_spec(spec)
            if not report.get("is_valid", False):
                write_status(job_dir, "running", "spec_healing", "Self-healing specification...")
                healed, _ = synthesizer.heal_spec(spec, report.get("critique", ""))
                if healed:
                    spec = healed

            sim_id = spec.get("simulation_id", f"sim_{int(time.time())}")
            clean_id = sim_id.strip().lower().replace(" ", "_")
            out_file = SAMPLES_DIR / f"{clean_id}_prompt.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(spec, f, indent=2)
            spec_path = str(out_file)
            print(f"[Pipeline] Stage 1 complete from notebook RAG cache. Spec: '{spec.get('title', 'Unknown')}'", file=sys.stderr)

        else:
            # Standalone fallback or empty notebook: Crawl Tavily and index
            write_status(job_dir, "running", "rag_research", "Searching Tavily for authoritative sources...")

            from rag_spec_agent.graph import build_rag_spec_graph

            rag_graph = build_rag_spec_graph()

            tavily_key = os.getenv("TAVILY_API_KEY", "")

            rag_initial_state = {
                "initial_query": topic,
                "simulation_query": topic,
                "tavily_api_key": tavily_key,
                "search_queries": [],
                "raw_documents": [],
                "indexed_document_count": 0,
                "rag_index_path": "",
                "retrieved_chunks": [],
                "retrieved_context_str": "",
                "dense_spec_json": {},
                "raw_llm_response": "",
                "validation_report": {},
                "is_valid": False,
                "critique": "",
                "iteration_count": 0,
                "max_iterations": 2,
                "output_json_path": "",
                "simulation_state": None,
                "auto_run_simulation": False,
                "status_message": "",
            }

            print(f"[Pipeline] Stage 1: RAG Spec Agent starting for '{topic}'...", file=sys.stderr)

            rag_state = rag_initial_state.copy()
            for event in rag_graph.stream(rag_initial_state):
                for node_name, node_output in event.items():
                    rag_state.update(node_output)
                    step_msg = node_output.get("status_message", "")
                    print(f"  [RAG Agent] {node_name}: {step_msg}", file=sys.stderr)

                    if "tavily" in node_name.lower() or "fetch" in node_name.lower():
                        write_status(job_dir, "running", "rag_research", step_msg)
                    elif "index" in node_name.lower():
                        write_status(job_dir, "running", "rag_indexing", step_msg)
                    elif "synth" in node_name.lower():
                        write_status(job_dir, "running", "spec_synthesis", step_msg)
                    elif "valid" in node_name.lower():
                        write_status(job_dir, "running", "spec_validation", step_msg)
                    elif "heal" in node_name.lower():
                        write_status(job_dir, "running", "spec_healing", step_msg)
                    elif "export" in node_name.lower():
                        write_status(job_dir, "running", "spec_export", step_msg)

            spec = rag_state.get("dense_spec_json", {})
            if not spec:
                raise RuntimeError("RAG Spec Agent produced no valid specification.")

            spec_path = rag_state.get("output_json_path", "")
            print(f"[Pipeline] Stage 1 complete. Spec: '{spec.get('title', 'Unknown')}'", file=sys.stderr)

            # If notebook_id was provided, sync newly crawled sources and chunks to the notebook cache
            if notebook_id:
                try:
                    crawled_docs = rag_state.get("raw_documents", [])
                    crawled_chunks = rag_state.get("retrieved_chunks", [])
                    nb_cache_file = PROJECT_ROOT / "scratch" / "rag_cache" / f"{notebook_id}.json"
                    nb_data = {}
                    if nb_cache_file.exists():
                        try:
                            with open(nb_cache_file, "r", encoding="utf-8") as f:
                                nb_data = json.load(f)
                        except Exception:
                            nb_data = {}
                    if not nb_data.get("sources") and crawled_docs:
                        nb_data["sources"] = [
                            {"id": f"src_{i}", "title": d.get("title", f"Source {i+1}"), "url": d.get("url", ""), "snippet": d.get("snippet", "")}
                            for i, d in enumerate(crawled_docs[:10])
                        ]
                    if not nb_data.get("chunks") and crawled_chunks:
                        nb_data["chunks"] = crawled_chunks
                    nb_data["notebookId"] = notebook_id
                    with open(nb_cache_file, "w", encoding="utf-8") as f:
                        json.dump(nb_data, f, indent=2)
                    print(f"[Pipeline] Synced {len(crawled_docs)} crawled sources to notebook cache '{notebook_id}'", file=sys.stderr)
                except Exception as sync_e:
                    print(f"[Pipeline] Warning: failed to sync sources to notebook: {sync_e}", file=sys.stderr)

        # =====================================================================
        # STAGE 2: LangGraph Simulation Agent — Code Generation
        # =====================================================================
        write_status(job_dir, "running", "code_generation", "Generating React + GSAP simulation code...")

        from langgraph_agent.graph import build_simulation_graph

        sim_graph = build_simulation_graph()

        sim_initial_state = {
            "raw_prompt": spec,
            "spec": {},
            "simulation_plan": "",
            "simulation_code": "",
            "component_name": "SimulationComponent",
            "verification_report": {},
            "needs_refinement": False,
            "critique": "",
            "iteration_count": 0,
            "max_iterations": 2,
            "best_code": "",
            "best_score": 0,
            "output_jsx_path": None,
            "output_html_path": None,
            "status_message": "Starting code generation...",
            "error": None,
        }

        print(f"[Pipeline] Stage 2: LangGraph Simulation Agent starting...", file=sys.stderr)

        sim_state = sim_initial_state.copy()
        for event in sim_graph.stream(sim_initial_state):
            for node_name, node_output in event.items():
                sim_state.update(node_output)
                step_msg = node_output.get("status_message", "")
                print(f"  [Sim Agent] {node_name}: {step_msg}", file=sys.stderr)

                if "parse" in node_name.lower():
                    write_status(job_dir, "running", "code_parsing", step_msg)
                elif "architect" in node_name.lower():
                    write_status(job_dir, "running", "code_blueprint", step_msg)
                elif "generate" in node_name.lower():
                    write_status(job_dir, "running", "code_generation", step_msg)
                elif "verify" in node_name.lower():
                    write_status(job_dir, "running", "code_verification", step_msg)
                elif "heal" in node_name.lower():
                    write_status(job_dir, "running", "code_healing", step_msg)
                elif "export" in node_name.lower():
                    write_status(job_dir, "running", "code_export", step_msg)

        output_html = sim_state.get("output_html_path", "")
        output_jsx = sim_state.get("output_jsx_path", "")
        component_name = sim_state.get("component_name", "SimulationComponent")

        if not output_html:
            raise RuntimeError("LangGraph Simulation Agent produced no preview.html.")

        # Derive slug from paths
        html_path = Path(output_html)
        slug = html_path.parent.name
        preview_url = f"/simulations/{slug}/preview.html"
        jsx_url = f"/simulations/{slug}/{component_name}.jsx"

        print(f"[Pipeline] Stage 2 complete. Output: {output_html}", file=sys.stderr)

        # =====================================================================
        # BUILD RESULT
        # =====================================================================
        sim_id = spec.get("simulation_id", slug)
        title = spec.get("title", topic)

        # Extract equations and key parameters from spec
        physics_model = spec.get("physics_model") or spec.get("domain_model") or {}
        equations = physics_model.get("fundamental_laws", [])
        if not equations:
            equations = list((physics_model.get("derived_formulas") or {}).keys())

        variables = physics_model.get("variables", {})
        key_params = []
        for var_key, var_data in list(variables.items())[:3]:
            if isinstance(var_data, dict):
                key_params.append({
                    "name": var_data.get("name", var_key),
                    "value": str(var_data.get("default", var_data.get("value", ""))),
                    "unit": var_data.get("unit", ""),
                })

        result = {
            "status": "completed",
            "jobId": job_id,
            "simulation": {
                "id": sim_id,
                "slug": slug,
                "title": title,
                "subtitle": spec.get("pedagogical_goal", "")[:80],
                "category": spec.get("topic", "Science"),
                "rating": "Dynamic",
                "duration": "Interactive",
                "date": "Just now",
                "description": spec.get("pedagogical_goal", ""),
                "previewUrl": preview_url,
                "jsxUrl": jsx_url,
                "promptFile": spec_path,
                "equations": equations[:3],
                "keyParameters": key_params,
                "accentColor": "#38bdf8",
                "isDynamic": True,
            }
        }

        # If notebook_id is provided, persist simulation to notebook disk cache
        if notebook_id:
            try:
                nb_cache_file = PROJECT_ROOT / "scratch" / "rag_cache" / f"{notebook_id}.json"
                nb_cache_file.parent.mkdir(parents=True, exist_ok=True)
                nb_data = {}
                if nb_cache_file.exists():
                    with open(nb_cache_file, "r", encoding="utf-8") as f:
                        nb_data = json.load(f)
                nb_data["simulation"] = result["simulation"]
                with open(nb_cache_file, "w", encoding="utf-8") as f:
                    json.dump(nb_data, f, indent=2)
            except Exception as e:
                print(f"[Pipeline] Warning: Could not update notebook cache: {e}", file=sys.stderr)

        write_status(job_dir, "completed", "done", "Simulation generated successfully!", result)

        # Output JSON result to stdout (for subprocess consumption)
        print(json.dumps(result, indent=2))
        return result

    except Exception as e:
        error_detail = traceback.format_exc()
        print(f"[Pipeline] ERROR: {e}", file=sys.stderr)
        print(error_detail, file=sys.stderr)

        error_result = {
            "status": "error",
            "jobId": job_id,
            "error": str(e),
            "detail": error_detail,
        }
        write_status(job_dir, "error", "failed", str(e), error_result)
        print(json.dumps(error_result, indent=2))
        return error_result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run full RAG + Simulation pipeline")
    parser.add_argument("--topic", required=True, help="Topic/query to generate simulation for")
    parser.add_argument("--job-id", default=None, help="Job ID for status tracking")
    parser.add_argument("--notebook-id", default=None, help="Notebook ID to use indexed RAG cache")
    args = parser.parse_args()

    run_full_pipeline(args.topic, args.job_id, args.notebook_id)
