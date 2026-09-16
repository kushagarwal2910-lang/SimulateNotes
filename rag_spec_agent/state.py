from typing import TypedDict, Optional, Dict, Any, List

class RAGSpecState(TypedDict):
    """
    LangGraph state schema for the Web Research, RAG Indexing,
    and Dense Simulation Specification Synthesizer Agent.
    """
    # Phase 1: Research Input & Search Planning
    initial_query: str
    search_queries: List[str]
    tavily_api_key: Optional[str]
    
    # Phase 2: Web Scraping & Ingestion (25-30 documents)
    raw_documents: List[Dict[str, Any]]
    indexed_document_count: int
    rag_index_path: Optional[str]
    
    # Phase 3: Interactive RAG Querying & Retrieval
    simulation_query: str
    retrieved_chunks: List[Dict[str, Any]]
    retrieved_context_str: str
    
    # Phase 4: High-Context LLM Dense JSON Spec Synthesis
    dense_spec_json: Dict[str, Any]
    raw_llm_response: str
    
    # Phase 5: Multi-Stage Validation & Self-Healing
    validation_report: Dict[str, Any]
    is_valid: bool
    critique: str
    iteration_count: int
    max_iterations: int
    
    # Phase 6: Output & Downstream Simulation Handoff
    output_json_path: Optional[str]
    auto_run_simulation: bool
    simulation_state: Optional[Dict[str, Any]]
    
    # Telemetry & Status
    status_message: str
    error: Optional[str]
