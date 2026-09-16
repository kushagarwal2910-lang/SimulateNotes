#!/usr/bin/env python
"""
LangGraph Simulation Agent - Top-level CLI Entrypoint.
Delegates to the reusable `langgraph_agent` package.
"""
from langgraph_agent.cli import run_cli

if __name__ == "__main__":
    run_cli()
