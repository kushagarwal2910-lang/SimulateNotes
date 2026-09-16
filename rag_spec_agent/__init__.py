"""
RAG Spec Agent - LangGraph-Powered Web Research & Dense Simulation Specification Synthesizer.
Takes natural language topics, fetches 25-30 authoritative documents via Tavily API,
indexes them in a local RAG vector store, accepts refined natural language queries,
and synthesizes dense, production-grade JSON prompts for the LangGraph Simulation Agent.
"""

from .state import RAGSpecState
from .graph import build_rag_spec_graph
from .cli import run_cli

__all__ = [
    "RAGSpecState",
    "build_rag_spec_graph",
    "run_cli",
]
