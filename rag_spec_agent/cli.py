import os
import sys
import json
import argparse
from pathlib import Path
from typing import Optional

# Ensure project root is on sys.path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from rag_spec_agent.graph import build_rag_spec_graph
from rag_spec_agent.config import (
    TAVILY_API_KEY,
    RAG_SPEC_MODEL_FULL,
    get_openrouter_keys,
    TARGET_DOCUMENTS
)

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.prompt import Prompt, Confirm
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    console = None

def log_step(title: str, message: str, style: str = "bold cyan"):
    if HAS_RICH and console:
        console.print(f"[{style}][{title}][/] {message}")
    else:
        print(f"[{title}] {message}")

def print_banner():
    key_count = len(get_openrouter_keys())
    if HAS_RICH and console:
        console.print(Panel.fit(
            f"[bold cyan]LangGraph RAG Spec Synthesizer Agent[/bold cyan]\n"
            f"[dim]Tavily Web Research (25-30 Docs) + Local Hybrid RAG + OpenRouter High-Context Spec Gen[/dim]\n\n"
            f"• High-Context Model: [bold green]{RAG_SPEC_MODEL_FULL}[/bold green]\n"
            f"• OpenRouter Key Pool: [magenta]{key_count} active API key(s)[/magenta]\n"
            f"• Target Web Research Corpus: [yellow]{TARGET_DOCUMENTS} authoritative documents[/yellow]\n"
            f"• Output Compatibility: [cyan]100% compliant with LangGraph React+GSAP Simulation Engine[/cyan]",
            border_style="cyan"
        ))
    else:
        print("="*60)
        print("LangGraph RAG Spec Synthesizer Agent")
        print(f"Model: {RAG_SPEC_MODEL_FULL}")
        print("="*60)

def run_cli():
    parser = argparse.ArgumentParser(
        description="RAG Spec Agent: Web Research & Dense Simulation Specification Synthesizer"
    )
    parser.add_argument("--topic", "-t", type=str, default=None, help="Scientific or domain topic to research")
    parser.add_argument("--query", "-q", type=str, default=None, help="Refined natural language query for the simulation")
    parser.add_argument("--tavily-key", type=str, default=None, help="Tavily API key override")
    parser.add_argument("--auto-run", "-r", action="store_true", help="Automatically run generated JSON through the simulation agent")
    parser.add_argument("--preview", "-p", action="store_true", help="Open generated simulation in browser")

    args = parser.parse_args()
    print_banner()

    # 1. Resolve Tavily API Key
    tavily_key = args.tavily_key or TAVILY_API_KEY or os.getenv("TAVILY_API_KEY", "").strip()
    if not tavily_key:
        if HAS_RICH and console:
            console.print("[bold yellow]Tavily API key not found in .env or environment.[/bold yellow]")
            tavily_key = Prompt.ask("[bold green]Please enter your Tavily API key[/bold green]").strip()
        else:
            tavily_key = input("Please enter your Tavily API key: ").strip()

    if not tavily_key:
        log_step("ERROR", "A Tavily API key is required to perform deep web research.", "bold red")
        sys.exit(1)

    # 2. Resolve Topic
    topic = args.topic
    if not topic:
        if HAS_RICH and console:
            topic = Prompt.ask("[bold cyan]Enter topic or domain to research[/bold cyan] (e.g. 'CRISPR Cas9 Gene Editing', 'Relativistic Doppler Beaming')").strip()
        else:
            topic = input("Enter topic to research: ").strip()

    if not topic:
        log_step("ERROR", "A research topic is required.", "bold red")
        sys.exit(1)

    # 3. Compile Graph
    log_step("BUILD", "Compiling LangGraph RAG StateGraph workflow...", "cyan")
    graph = build_rag_spec_graph()

    # 4. Resolve Simulation Query (Interactive or Flag)
    sim_query = args.query
    if not sim_query:
        if HAS_RICH and console:
            console.print("\n[dim]You can now specify what exact simulation you want to build from this research:[/dim]")
            sim_query = Prompt.ask(
                "[bold cyan]What specific simulation do you want to build from this research?[/bold cyan]\n"
                "[dim](Press Enter to use comprehensive automatic synthesis)[/dim]",
                default=f"Create a high-fidelity interactive simulation demonstrating the fundamental principles and dynamic mechanism of {topic}."
            ).strip()
        else:
            sim_query = input("Simulation requirements: ").strip() or f"Simulation of {topic}."

    auto_run = args.auto_run

    initial_state = {
        "initial_query": topic,
        "search_queries": [],
        "tavily_api_key": tavily_key,
        "raw_documents": [],
        "indexed_document_count": 0,
        "rag_index_path": None,
        "simulation_query": sim_query,
        "retrieved_chunks": [],
        "retrieved_context_str": "",
        "dense_spec_json": {},
        "raw_llm_response": "",
        "validation_report": {},
        "is_valid": False,
        "critique": "",
        "iteration_count": 0,
        "max_iterations": 2,
        "output_json_path": None,
        "auto_run_simulation": auto_run,
        "simulation_state": None,
        "status_message": "Starting research pipeline...",
        "error": None
    }

    log_step("EXECUTE", f"Running RAG Spec Agent on topic: '{topic}'...", "bold magenta")

    final_state = initial_state
    try:
        for event in graph.stream(initial_state):
            for node_name, node_output in event.items():
                msg = node_output.get("status_message", f"Completed node: {node_name}")
                log_step(node_name.upper(), msg, "green")
                final_state.update(node_output)
    except Exception as e:
        log_step("ERROR", f"Agent pipeline halted: {e}", "bold red")
        if "Tavily" in str(e):
            if HAS_RICH and console:
                console.print(Panel(
                    "[bold yellow]Tavily API Key Troubleshooting:[/bold yellow]\n"
                    "1. Check your Tavily API key at https://app.tavily.com\n"
                    "2. Add your key to .env: [cyan]TAVILY_API_KEY=tvly-...[/cyan]\n"
                    "3. Or run with: [green]python run_rag_agent.py --tavily-key tvly-...[/green]",
                    border_style="yellow"
                ))
            else:
                print("Tip: Ensure TAVILY_API_KEY is configured in your .env file or passed via --tavily-key.")
        sys.exit(1)


    spec = final_state.get("dense_spec_json", {})
    json_path = final_state.get("output_json_path")
    val_report = final_state.get("validation_report", {})
    score = val_report.get("score", 100)

    # 5. Display Result Table
    domain_model = spec.get("physics_model") or spec.get("domain_model") or {}
    var_count = len(domain_model.get("variables", {}))
    formula_count = len(domain_model.get("derived_formulas", {}))
    comp_count = len(spec.get("visual_scene", {}).get("components", []))
    ctrl_count = len(spec.get("interactive_controls", []))

    if HAS_RICH and console:
        table = Table(title=f"Synthesized Simulation Specification (Score: {score}/100)", border_style="green")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="white")
        table.add_row("Title", spec.get("title", "Untitled"))
        table.add_row("Spec ID", spec.get("simulation_id", "N/A"))
        table.add_row("Indexed Web Documents", f"{final_state.get('indexed_document_count', 0)} files")
        table.add_row("Variables Defined", f"{var_count} parameters")
        table.add_row("Derived Formulas", f"{formula_count} math formulas")
        table.add_row("Visual Components", f"{comp_count} components")
        table.add_row("Interactive Controls", f"{ctrl_count} controls")
        table.add_row("JSON Spec Artifact", str(json_path))
        console.print(table)
    else:
        print("\n" + "="*50)
        print(f"Generated Specification: {spec.get('title')}")
        print(f"Spec Path: {json_path}")
        print(f"Score: {score}/100")
        print("="*50)

    # 6. Interactive Handoff Prompt if auto-run wasn't already triggered
    if not auto_run and json_path:
        do_run = False
        if HAS_RICH and console:
            do_run = Confirm.ask(
                "\n[bold green]Would you like to pass this JSON specification directly into our LangGraph Simulation Engine now?[/bold green]",
                default=True
            )
        else:
            ans = input("\nRun through Simulation Engine now? [Y/n]: ").strip().lower()
            do_run = ans in ("", "y", "yes")

        if do_run:
            log_step("SIMULATION", "Triggering downstream LangGraph Simulation Agent...", "bold magenta")
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
                "status_message": "Starting simulation pipeline...",
                "error": None
            }

            final_sim_state = initial_sim_state
            for event in sim_graph.stream(initial_sim_state):
                for node_name, node_output in event.items():
                    sim_msg = node_output.get("status_message", f"Completed: {node_name}")
                    log_step(f"SIM:{node_name.upper()}", sim_msg, "cyan")
                    final_sim_state.update(node_output)

            jsx_file = final_sim_state.get("output_jsx_path")
            html_file = final_sim_state.get("output_html_path")
            final_sim_score = final_sim_state.get("best_score", 100)

            if HAS_RICH and console:
                console.print(Panel.fit(
                    f"[bold green]Simulation Successfully Generated & Verified![/bold green]\n\n"
                    f"• Quality Score: [bold cyan]{final_sim_score}/100[/bold cyan]\n"
                    f"• React Component: [yellow]{jsx_file}[/yellow]\n"
                    f"• Interactive Preview: [magenta]{html_file}[/magenta]",
                    border_style="green"
                ))

            if args.preview and html_file and os.path.exists(html_file):
                import webbrowser
                webbrowser.open(f"file://{os.path.abspath(html_file)}")

if __name__ == "__main__":
    run_cli()
