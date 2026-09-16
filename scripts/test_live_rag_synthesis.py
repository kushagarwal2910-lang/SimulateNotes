"""
Live End-to-End Verification of Tavily Research & OpenRouter Spec Synthesis.
"""

import sys
import json
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from rag_spec_agent.tavily_crawler import fetch_documents_with_tavily
from rag_spec_agent.rag_engine import LocalRAGIndex, build_structured_context
from rag_spec_agent.synthesizer import SpecSynthesizer
from rag_spec_agent.validator import validate_simulation_spec

def run_live_test():
    topic = "Venturi Effect Bernoulli Principle"
    print(f"1. Fetching authoritative documents from Tavily for: '{topic}'...")
    docs = fetch_documents_with_tavily(topic, target_count=6)
    print(f"[OK] Fetched {len(docs)} documents.")
    for d in docs[:3]:
        print(f"   - {d['title']} ({d['url']})")

    print("\n2. Indexing in local hybrid RAG vector index...")
    index = LocalRAGIndex("live_test_venturi")
    n_chunks = index.index_documents(docs)
    print(f"[OK] Indexed {n_chunks} chunks.")

    query = "Venturi throat velocity increase and pressure drop equations"
    print(f"\n3. Querying RAG index for: '{query}'...")
    chunks = index.query(query, top_k=5)
    print(f"[OK] Retrieved {len(chunks)} top chunks.")
    context_str = build_structured_context(chunks)

    print("\n4. Synthesizing dense JSON simulation specification via OpenRouter Gateway...")
    synthesizer = SpecSynthesizer()
    spec, raw_resp = synthesizer.synthesize_spec(topic, query, context_str)
    
    assert spec is not None, f"Failed to parse JSON specification! Raw response:\n{raw_resp[:300]}"
    print(f"[OK] Successfully synthesized specification: '{spec.get('title')}'")
    print(f"   - Spec ID: {spec.get('simulation_id')}")

    print("\n5. Validating mathematical soundness and schema...")
    report = validate_simulation_spec(spec)
    print(f"[OK] Quality Score: {report['score']}/100 | Is Valid: {report['is_valid']}")
    if not report["is_valid"]:
        print("Critiques:\n", report["critique"])
    assert report["score"] >= 80, f"Score below 80: {report['score']}"

    # Save to samples/live_test_venturi_prompt.json
    out_file = root_dir / "samples" / "live_test_venturi_prompt.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)
    print(f"[OK] Saved candidate specification to: {out_file.name}")
    print("\n" + "="*60)
    print("LIVE END-TO-END RAG SPEC SYNTHESIS TEST PASSED!")
    print("="*60)

if __name__ == "__main__":
    run_live_test()
