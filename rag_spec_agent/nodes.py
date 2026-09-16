import os
import json
import hashlib
from pathlib import Path
from typing import Dict, Any

from .state import RAGSpecState
from .config import SAMPLES_DIR, RAG_CACHE_DIR, TARGET_DOCUMENTS
from .tavily_crawler import generate_sub_queries, fetch_documents_with_tavily
from .rag_engine import LocalRAGIndex, build_structured_context
from .synthesizer import SpecSynthesizer
from .validator import validate_simulation_spec

# ------------------------------------------------------------------------------
# NODE 1: RESEARCH PLANNING
# ------------------------------------------------------------------------------
def plan_research_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 1: Analyzes initial topic and generates diverse search sub-queries."""
    topic = state.get("initial_query", "").strip()
    if not topic:
        raise ValueError("initial_query is empty. Please provide a topic or scientific concept.")

    queries = generate_sub_queries(topic)
    return {
        "search_queries": queries,
        "iteration_count": 0,
        "max_iterations": state.get("max_iterations", 2),
        "status_message": f"Planned {len(queries)} comprehensive research queries for '{topic}'."
    }


# ------------------------------------------------------------------------------
# NODE 2: TAVILY WEB CRAWLER (25-30 DOCUMENTS)
# ------------------------------------------------------------------------------
def fetch_tavily_documents_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 2: Executes Tavily search API, fetching and deduplicating 25-30 web files."""
    topic = state["initial_query"]
    api_key = state.get("tavily_api_key")

    docs = fetch_documents_with_tavily(topic, api_key=api_key, target_count=TARGET_DOCUMENTS)
    if not docs:
        raise RuntimeError(f"Tavily could not retrieve any documents for topic: '{topic}'. Check network or API key.")

    return {
        "raw_documents": docs,
        "indexed_document_count": len(docs),
        "status_message": f"Retrieved and deduplicated {len(docs)} high-quality web documents from Tavily."
    }


# ------------------------------------------------------------------------------
# NODE 3: LOCAL RAG INDEXING
# ------------------------------------------------------------------------------
def index_rag_documents_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 3: Chunks fetched documents and builds local hybrid RAG vector index."""
    topic = state["initial_query"]
    topic_hash = hashlib.md5(topic.encode("utf-8")).hexdigest()[:10]
    index_id = f"rag_{topic_hash}"

    index = LocalRAGIndex(index_id)
    n_chunks = index.index_documents(state["raw_documents"])
    saved_path = index.save()

    return {
        "rag_index_path": str(saved_path),
        "status_message": f"Indexed {n_chunks} chunks from {len(state['raw_documents'])} documents into hybrid RAG store."
    }


# ------------------------------------------------------------------------------
# NODE 4: RAG CONTEXT RETRIEVAL
# ------------------------------------------------------------------------------
def retrieve_simulation_context_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 4: Retrieves top relevant chunks for the user's specific simulation requirements."""
    sim_query = state.get("simulation_query") or state.get("initial_query") or ""
    index_path = state.get("rag_index_path")

    if not index_path or not os.path.exists(index_path):
        raise FileNotFoundError(f"RAG index not found at: {index_path}")

    index = LocalRAGIndex.load(Path(index_path))
    retrieved = index.query(sim_query, top_k=16)
    structured_context = build_structured_context(retrieved)

    return {
        "retrieved_chunks": retrieved,
        "retrieved_context_str": structured_context,
        "status_message": f"Retrieved top {len(retrieved)} technical chunks covering formulas, mechanics, and visual layouts."
    }


# ------------------------------------------------------------------------------
# NODE 5: HIGH-CONTEXT SPEC SYNTHESIS
# ------------------------------------------------------------------------------
def synthesize_dense_spec_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 5: High-context LLM synthesizes dense JSON specification via OpenRouter."""
    topic = state["initial_query"]
    sim_query = state.get("simulation_query") or topic
    context = state["retrieved_context_str"]

    synthesizer = SpecSynthesizer()
    spec, raw_resp = synthesizer.synthesize_spec(topic, sim_query, context)

    if not spec:
        return {
            "dense_spec_json": {},
            "raw_llm_response": raw_resp,
            "is_valid": False,
            "critique": "Failed to parse valid JSON from model response.",
            "status_message": "LLM response did not contain parseable JSON. Triggering healing..."
        }

    title = spec.get("title", "Simulation Specification")
    return {
        "dense_spec_json": spec,
        "raw_llm_response": raw_resp,
        "status_message": f"Successfully synthesized candidate specification: '{title}'."
    }


# ------------------------------------------------------------------------------
# NODE 6: SPEC VALIDATION
# ------------------------------------------------------------------------------
def validate_spec_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 6: Validates candidate JSON for schema compliance, mathematical soundness, and visual depth."""
    spec = state.get("dense_spec_json")
    if not spec:
        return {
            "validation_report": {"score": 0, "is_valid": False, "critique": "No specification found."},
            "is_valid": False,
            "critique": "Empty specification.",
            "status_message": "Validation failed: specification is empty."
        }

    report = validate_simulation_spec(spec)
    score = report["score"]
    is_valid = report["is_valid"]

    if is_valid:
        msg = f"Specification verified with flawless quality score ({score}/100)!"
    else:
        msg = f"Validation score: {score}/100. Issues detected: {report['critique'][:100]}..."

    return {
        "validation_report": report,
        "is_valid": is_valid,
        "critique": report["critique"],
        "status_message": msg
    }


# ------------------------------------------------------------------------------
# NODE 7: SELF-HEALING REPAIR
# ------------------------------------------------------------------------------
def heal_spec_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 7: Auto-repairs missing variables, syntax errors, or schema defects."""
    current_iter = state.get("iteration_count", 0) + 1
    critique = state.get("critique", "Repair syntax and schema errors.")
    candidate = state.get("dense_spec_json", {})

    synthesizer = SpecSynthesizer()
    repaired, raw_resp = synthesizer.heal_spec(candidate, critique)

    return {
        "dense_spec_json": repaired or candidate,
        "raw_llm_response": raw_resp,
        "iteration_count": current_iter,
        "status_message": f"Completed self-healing iteration {current_iter}/{state.get('max_iterations', 2)}."
    }


# ------------------------------------------------------------------------------
# NODE 8: EXPORT AND DOWNSTREAM HANDOFF
# ------------------------------------------------------------------------------
def export_and_handoff_node(state: RAGSpecState) -> Dict[str, Any]:
    """Node 8: Saves validated JSON specification and optionally invokes existing simulation engine."""
    spec = state["dense_spec_json"]
    sim_id = spec.get("simulation_id", "simulation_prompt")
    clean_id = sim_id.strip().lower().replace(" ", "_")
    
    out_file = SAMPLES_DIR / f"{clean_id}_prompt.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)

    sim_state = None
    if state.get("auto_run_simulation", False):
        try:
            from langgraph_agent.graph import build_simulation_graph
            sim_graph = build_simulation_graph()

            initial_sim_state = {
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
                "status_message": "Auto-invoked from RAG Spec Agent...",
                "error": None
            }

            final_sim_state = initial_sim_state
            for event in sim_graph.stream(initial_sim_state):
                for node_name, node_output in event.items():
                    final_sim_state.update(node_output)

            sim_state = final_sim_state
        except Exception as e:
            sim_state = {"error": str(e)}

    status_msg = f"Exported verified prompt specification to: {out_file.name}"
    if sim_state and sim_state.get("output_html_path"):
        status_msg += f" | Simulation compiled: {sim_state.get('output_html_path')}"

    return {
        "output_json_path": str(out_file),
        "simulation_state": sim_state,
        "status_message": status_msg
    }
