from langgraph.graph import StateGraph, START, END
from typing import Dict, Any

from .state import SimulationState
from .nodes import (
    parse_and_validate_input,
    architect_simulation,
    generate_simulation_code,
    verify_and_critique_code,
    heal_simulation_code,
    export_artifacts
)

def should_refine(state: SimulationState) -> str:
    """Conditional edge router based on code verification outcome."""
    if state.get("needs_refinement", False):
        return "heal_code"
    return "export"

def build_simulation_graph() -> StateGraph:
    """Constructs and compiles the LangGraph state machine for simulation generation."""
    workflow = StateGraph(SimulationState)
    
    # Register Nodes
    workflow.add_node("parse_input", parse_and_validate_input)
    workflow.add_node("architect", architect_simulation)
    workflow.add_node("generate_code", generate_simulation_code)
    workflow.add_node("verify_code", verify_and_critique_code)
    workflow.add_node("heal_code", heal_simulation_code)
    workflow.add_node("export", export_artifacts)
    
    # Define Linear Flow
    workflow.add_edge(START, "parse_input")
    workflow.add_edge("parse_input", "architect")
    workflow.add_edge("architect", "generate_code")
    workflow.add_edge("generate_code", "verify_code")
    
    # Conditional Feedback Loop
    workflow.add_conditional_edges(
        "verify_code",
        should_refine,
        {
            "heal_code": "heal_code",
            "export": "export"
        }
    )
    
    # Heal loops back to verify
    workflow.add_edge("heal_code", "verify_code")
    
    # Terminal edge
    workflow.add_edge("export", END)
    
    return workflow.compile()

def run_simulation_agent(json_prompt: Any) -> SimulationState:
    """Convenience execution helper for running the compiled graph."""
    app = build_simulation_graph()
    initial_state = {
        "raw_prompt": json_prompt,
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
        "status_message": "Initializing...",
        "error": None
    }
    
    return app.invoke(initial_state)
