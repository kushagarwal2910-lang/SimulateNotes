"""
Test suite for rag_spec_agent components:
- Graph compilation
- Chunker and RAG vector store indexing & retrieval
- JSON Specification Validator against actual samples
- Sub-query generation
"""

import sys
import json
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from rag_spec_agent.graph import build_rag_spec_graph
from rag_spec_agent.tavily_crawler import generate_sub_queries
from rag_spec_agent.rag_engine import TextChunker, LocalRAGIndex, build_structured_context
from rag_spec_agent.validator import validate_simulation_spec, extract_json_from_text

def test_graph_compilation():
    print("Testing LangGraph compilation...")
    graph = build_rag_spec_graph()
    assert graph is not None, "Graph compilation returned None!"
    print("[OK] LangGraph StateGraph compiled successfully.")

def test_sub_query_generation():
    print("Testing Tavily sub-query planner...")
    queries = generate_sub_queries("Quantum Hall Effect")
    assert len(queries) == 4, f"Expected 4 sub-queries, got {len(queries)}"
    for q in queries:
        assert "Quantum Hall Effect" in q
    print(f"[OK] Generated {len(queries)} diverse queries: {queries[0]}")

def test_rag_indexing_and_retrieval():
    print("Testing local hybrid RAG indexing and retrieval...")
    mock_docs = [
        {
            "id": "doc_01",
            "title": "Quantum Tunneling Overview",
            "url": "https://example.com/tunneling",
            "content": "Quantum tunneling occurs when a wavepacket hits a potential energy barrier V0 > E. The wavefunction decays exponentially psi(x) = exp(-kappa * x) where kappa = sqrt(2m(V0 - E))/hbar."
        },
        {
            "id": "doc_02",
            "title": "Transmission Coefficient Derivation",
            "url": "https://example.com/transmission",
            "content": "The transmission probability T is calculated using WKB approximation T = exp(-2 * kappa * L) or exact formula with sinh(kappa * L). Particle energy E and barrier width L are the primary control parameters."
        },
        {
            "id": "doc_03",
            "title": "Visualizing Probability Current",
            "url": "https://example.com/visualization",
            "content": "Visual representation displays incident sinusoidal wave, evanescent exponential decay inside the barrier, and reduced amplitude transmitted wave in Region 3."
        }
    ]

    index = LocalRAGIndex("test_index")
    n_chunks = index.index_documents(mock_docs)
    assert n_chunks >= 3, f"Expected at least 3 chunks, got {n_chunks}"
    print(f"[OK] Indexed {n_chunks} chunks.")

    results = index.query("kappa transmission probability formula", top_k=2)
    assert len(results) > 0, "Expected non-empty retrieval results!"
    top_chunk = results[0]
    print(f"[OK] Top retrieved chunk [{top_chunk['chunk_id']}] score={top_chunk['score']:.3f}: {top_chunk['title']}")
    
    context_str = build_structured_context(results)
    assert "Research Source" in context_str
    print("[OK] Structured research dossier built cleanly.")

def test_validator_against_existing_samples():
    print("Testing specification validator against existing production samples...")
    sample_files = [
        root_dir / "samples" / "bernoulli_simulation_prompt.json",
        root_dir / "samples" / "quantum_tunneling_prompt.json"
    ]
    
    for s_path in sample_files:
        if not s_path.exists():
            continue
        with open(s_path, "r", encoding="utf-8") as f:
            spec = json.load(f)
        
        report = validate_simulation_spec(spec)
        print(f"[OK] Validated {s_path.name}: score={report['score']}/100, is_valid={report['is_valid']}")
        assert report["score"] >= 85, f"Expected score >= 85 for {s_path.name}, got {report['score']}"

def test_json_extractor():
    print("Testing markdown JSON extractor...")
    raw_text = """Here is your simulation spec:
```json
{
  "simulation_id": "test_sim",
  "title": "Test Simulation",
  "physics_model": {
    "variables": {"x": {"name": "X", "default": 1.0}},
    "derived_formulas": {"y": "x * 2"}
  }
}
```
Hope this helps!"""
    spec, err = extract_json_from_text(raw_text)
    assert spec is not None, f"Failed to extract JSON: {err}"
    assert spec["simulation_id"] == "test_sim"
    print("[OK] Markdown JSON extracted and parsed flawlessly.")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("RUNNING RAG SPEC AGENT COMPONENT TESTS")
    print("="*60)
    test_graph_compilation()
    test_sub_query_generation()
    test_rag_indexing_and_retrieval()
    test_validator_against_existing_samples()
    test_json_extractor()
    print("\n" + "="*60)
    print("ALL TESTS PASSED SUCCESSFULLY! (5/5)")
    print("="*60)
