#!/usr/bin/env python
"""
LangGraph RAG Spec Synthesizer Agent - Top-level CLI Entrypoint.
Performs web research via Tavily (25-30 documents), indexes into local hybrid RAG,
interactively accepts natural language simulation queries, and synthesizes dense JSON
prompts for the LangGraph Simulation Agent.
"""
from rag_spec_agent.cli import run_cli

if __name__ == "__main__":
    run_cli()
