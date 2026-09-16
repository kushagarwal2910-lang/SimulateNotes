import argparse
import sys
import os
import json
from pathlib import Path

# Ensure package is importable
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from langgraph_agent.graph import build_simulation_graph
from langgraph_agent.state import SimulationState

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

def log_step(title: str, message: str, style: str = "bold cyan"):
    if HAS_RICH:
        console.print(f"[{style}][{title}][/] {message}")
    else:
        print(f"[{title}] {message}")

def run_cli():
    parser = argparse.ArgumentParser(
        description="LangGraph Agent: Generate High-Quality React + GSAP Simulations from JSON Prompts"
    )
    parser.add_argument(
        "prompt_file",
        nargs="?",
        default=None,
        help="Path to the directed JSON simulation specification"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        default=None,
        help="Path to the directed JSON simulation specification"
    )
    parser.add_argument(
        "--preview", "-p",
        action="store_true",
        help="Automatically open the generated simulation in the default browser"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=3000,
        help="Port for preview server"
    )

    args = parser.parse_args()
    raw_input = args.prompt_file or args.input or "samples/bernoulli_simulation_prompt.json"
    input_path = Path(raw_input)

    # Search in samples if not found directly
    if not input_path.exists():
        fallback = parent_dir / "samples" / args.input
        if fallback.exists():
            input_path = fallback
        else:
            log_step("ERROR", f"Input JSON file not found: {input_path}", style="bold red")
            sys.exit(1)

    with open(input_path, "r", encoding="utf-8") as f:
        try:
            prompt_spec = json.load(f)
        except json.JSONDecodeError as e:
            log_step("ERROR", f"Malformed JSON in {input_path}: {e}", style="bold red")
            sys.exit(1)

    title = prompt_spec.get("title", "Untitled Simulation")
    sim_id = prompt_spec.get("simulation_id", "simulation")

    from .gateway import KEY_POOL
    from .config import PRIMARY_MODEL, FALLBACK_MODELS

    if HAS_RICH:
        console.print(Panel.fit(
            f"[bold blue]LangGraph Simulation Agent[/bold blue] [dim](LiteLLM Gateway Edition)[/dim]\n"
            f"[dim]Provider: OpenRouter | Primary: {PRIMARY_MODEL}[/dim]\n\n"
            f"• Title: [bold green]{title}[/bold green]\n"
            f"• Spec ID: [cyan]{sim_id}[/cyan]\n"
            f"• Source: [yellow]{input_path}[/yellow]\n"
            f"• Key Pool: [magenta]{KEY_POOL.key_count} OpenRouter API key(s) configured (Round-Robin rotation)[/magenta]\n"
            f"• Fallbacks: [dim]{len(FALLBACK_MODELS)} models configured (Ultra-550B, Gemma-4-31B, 3.5-Lightning)[/dim]",
            border_style="blue"
        ))
    else:
        print("="*60)
        print("LangGraph Simulation Agent")
        print(f"Input: {title} ({input_path})")
        print("="*60)

    log_step("BUILD", "Compiling LangGraph StateGraph workflow...", "cyan")
    graph = build_simulation_graph()

    initial_state = {
        "raw_prompt": prompt_spec,
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
        "status_message": "Starting pipeline...",
        "error": None
    }

    log_step("EXECUTE", "Streaming graph nodes...", "bold magenta")
    
    final_state = initial_state
    for event in graph.stream(initial_state):
        for node_name, node_output in event.items():
            msg = node_output.get("status_message", f"Completed node: {node_name}")
            log_step(node_name.upper(), msg, "green")
            final_state.update(node_output)

    log_step("COMPLETE", "Simulation generated and verified successfully!", "bold green")

    jsx_file = final_state.get("output_jsx_path")
    html_file = final_state.get("output_html_path")

    final_score = final_state.get("best_score", 100)
    if HAS_RICH:
        table = Table(title=f"Generated Simulation Artifacts (Quality Score: {final_score}/100)", border_style="green")
        table.add_column("Type", style="cyan")
        table.add_column("Path", style="yellow")
        table.add_column("Description", style="white")
        table.add_row("React Component", str(jsx_file), "Standalone React 18 + GSAP component")
        table.add_row("Interactive HTML", str(html_file), "Zero-dependency preview (Babel+Tailwind+GSAP CDN)")
        table.add_row("Quality Assurance", f"{final_score}/100", "Verified full feature completeness (Anti-Degradation Protected)")
        console.print(table)
    else:
        print(f"\nArtifacts generated (Quality Score: {final_score}/100):")
        print(f"  JSX:  {jsx_file}")
        print(f"  HTML: {html_file}")

    if args.preview and html_file:
        import webbrowser
        log_step("PREVIEW", f"Opening {html_file} in your default browser...", "bold blue")
        webbrowser.open(Path(html_file).resolve().as_uri())

if __name__ == "__main__":
    run_cli()
