from typing import TypedDict, Optional, Dict, Any, List

class SimulationState(TypedDict):
    # Input
    raw_prompt: Any
    spec: Dict[str, Any]
    
    # Architecture Blueprint
    simulation_plan: str
    
    # Generated Code
    simulation_code: str
    component_name: str
    
    # Verification & Healing Loop
    verification_report: Dict[str, Any]
    needs_refinement: bool
    critique: str
    iteration_count: int
    max_iterations: int
    
    # Candidate Quality & Healing Tracking
    best_code: str
    best_score: int
    
    # Packaging & Export
    output_jsx_path: Optional[str]
    output_html_path: Optional[str]
    status_message: str
    error: Optional[str]
