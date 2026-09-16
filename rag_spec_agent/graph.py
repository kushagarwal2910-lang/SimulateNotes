from langgraph.graph import StateGraph, START, END
from .state import RAGSpecState
from .nodes import (
    plan_research_node,
    fetch_tavily_documents_node,
    index_rag_documents_node,
    retrieve_simulation_context_node,
    synthesize_dense_spec_node,
    validate_spec_node,
    heal_spec_node,
    export_and_handoff_node
)

def should_heal(state: RAGSpecState) -> str:
    """Conditional routing: checks if spec is valid or max iterations reached."""
    if state.get("is_valid", False):
        return "export_and_handoff"
    
    iter_count = state.get("iteration_count", 0)
    max_iter = state.get("max_iterations", 2)
    
    if iter_count >= max_iter:
        return "export_and_handoff"
    
    return "heal_spec"

def build_rag_spec_graph():
    """
    Compiles the complete LangGraph StateGraph workflow for
    Web Research (25-30 docs) -> RAG Vector Index -> Context Retrieval ->
    Dense Spec Synthesis -> Self-Healing Validation -> Export & Handoff.
    """
    workflow = StateGraph(RAGSpecState)

    # Add Nodes
    workflow.add_node("plan_research", plan_research_node)
    workflow.add_node("fetch_tavily_documents", fetch_tavily_documents_node)
    workflow.add_node("index_rag_documents", index_rag_documents_node)
    workflow.add_node("retrieve_simulation_context", retrieve_simulation_context_node)
    workflow.add_node("synthesize_dense_spec", synthesize_dense_spec_node)
    workflow.add_node("validate_spec", validate_spec_node)
    workflow.add_node("heal_spec", heal_spec_node)
    workflow.add_node("export_and_handoff", export_and_handoff_node)

    # Add Edges
    workflow.add_edge(START, "plan_research")
    workflow.add_edge("plan_research", "fetch_tavily_documents")
    workflow.add_edge("fetch_tavily_documents", "index_rag_documents")
    workflow.add_edge("index_rag_documents", "retrieve_simulation_context")
    workflow.add_edge("retrieve_simulation_context", "synthesize_dense_spec")
    workflow.add_edge("synthesize_dense_spec", "validate_spec")

    # Conditional Self-Healing Loop
    workflow.add_conditional_edges(
        "validate_spec",
        should_heal,
        {
            "heal_spec": "heal_spec",
            "export_and_handoff": "export_and_handoff"
        }
    )
    workflow.add_edge("heal_spec", "validate_spec")
    workflow.add_edge("export_and_handoff", END)

    return workflow.compile()
