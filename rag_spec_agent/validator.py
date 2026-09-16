import re
import json
from typing import Dict, Any, List, Tuple, Optional
from pydantic import ValidationError

from .prompts import SimulationPromptSpec

STANDARD_JS_BUILTINS = {
    "Math", "min", "max", "pow", "sqrt", "sin", "cos", "tan", "asin", "acos", "atan", "atan2",
    "sinh", "cosh", "tanh", "asinh", "acosh", "atanh", "hypot",
    "exp", "log", "log10", "log2", "abs", "floor", "ceil", "round", "PI", "pi", "E", "e",
    "true", "false", "null", "undefined", "NaN", "Infinity"
}

def extract_json_from_text(text: str) -> Tuple[Optional[Dict[str, Any]], str]:
    """
    Extracts and parses JSON from markdown code blocks or raw string.
    Handles unclosed fences, trailing commas, comments, and missing closing braces gracefully.
    """
    if not text:
        return None, "Empty response received."

    # 1. Try finding balanced code fence ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        candidate = match.group(1).strip()
    else:
        # If no closed fence, strip leading ```json or ``` if present
        candidate = re.sub(r"^```(?:json)?\s*", "", text.strip())
        candidate = re.sub(r"\s*```$", "", candidate).strip()

    # 2. Extract outermost JSON object { ... }
    first_brace = candidate.find("{")
    last_brace = candidate.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        candidate = candidate[first_brace:last_brace + 1]
    elif first_brace != -1 and last_brace <= first_brace:
        candidate = candidate[first_brace:]

    # Helper function to attempt parse with cleanup
    def try_parse(s: str) -> Optional[Dict[str, Any]]:
        try:
            d = json.loads(s)
            if isinstance(d, dict):
                return d
        except Exception:
            pass
        # Clean trailing commas and comments
        c = re.sub(r",\s*([\]}])", r"\1", s)
        c = re.sub(r"//.*?\n", "\n", c)
        try:
            d = json.loads(c)
            if isinstance(d, dict):
                return d
        except Exception:
            pass
        return None

    parsed = try_parse(candidate)
    if parsed:
        return parsed, ""

    # 3. If unclosed braces, attempt auto-closing
    open_braces = candidate.count("{") - candidate.count("}")
    if open_braces > 0:
        repaired = candidate + ("}" * open_braces)
        parsed = try_parse(repaired)
        if parsed:
            return parsed, ""

    return None, "Failed to parse structured JSON from model output."


def extract_identifiers(expr: str) -> List[str]:
    """Extracts all variable identifiers from a JavaScript math formula, ignoring string literals."""
    # Strip string literals ('...' and "...") so text inside quotes isn't treated as variables
    stripped = re.sub(r"(['\"]).*?\1", " ", expr)
    tokens = re.findall(r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", stripped)
    return [t for t in tokens if t not in STANDARD_JS_BUILTINS]


def validate_simulation_spec(spec: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates a candidate simulation specification for schema compliance,
    mathematical soundness, variable binding, and visual richness.
    Returns a detailed validation report with score (0-100) and critiques.
    """
    critiques: List[str] = []
    score = 100

    # 1. Pydantic schema validation
    try:
        SimulationPromptSpec.model_validate(spec)
    except ValidationError as ve:
        score -= 25
        for err in ve.errors()[:4]:
            loc = " -> ".join(str(l) for l in err.get("loc", []))
            critiques.append(f"Schema violation at [{loc}]: {err.get('msg', '')}")

    # 2. Extract model variables
    domain_model = spec.get("physics_model") or spec.get("domain_model") or {}
    if not isinstance(domain_model, dict):
        domain_model = {}
    variables = domain_model.get("variables", {})
    if not isinstance(variables, dict):
        variables = {}
    if not variables:
        score -= 30
        critiques.append("CRITICAL: 'physics_model.variables' is empty or missing! At least 3 interactive parameters required.")
    
    var_keys = set(variables.keys())

    # 3. Mathematical Formula Consistency
    derived = domain_model.get("derived_formulas", {})
    if not isinstance(derived, dict) or not derived:
        score -= 20
        critiques.append("WARNING: 'derived_formulas' is empty. Realistic physics simulations must compute derived state.")
    else:
        for f_name, formula in derived.items():
            if not isinstance(formula, str):
                score -= 10
                critiques.append(f"Formula '{f_name}' must be a string expression.")
                continue

            # Detect illegal LaTeX
            if any(k in formula for k in ["\\frac", "\\sqrt", "\\cdot", "\\times", "\\approx"]):
                score -= 15
                critiques.append(f"Formula '{f_name}' contains LaTeX syntax ({formula}). Must be executable JavaScript (e.g. Math.sqrt).")

            # Check variable bindings
            tokens = extract_identifiers(formula)
            for t in tokens:
                if t not in var_keys and t not in derived:
                    score -= 5
                    critiques.append(f"Formula '{f_name}' references undefined variable '{t}'. Must be declared in variables.")

    # 4. Interactive Controls Consistency
    controls = spec.get("interactive_controls", [])
    if not isinstance(controls, list) or not controls:
        score -= 15
        critiques.append("Missing 'interactive_controls'. At least 2 sliders and playback controls are required.")
    else:
        bound_controls = 0
        for c in controls:
            if not isinstance(c, dict):
                score -= 5
                critiques.append("Interactive control must be a JSON object with 'param' and 'label'.")
                continue
            param = c.get("param")
            if param:
                bound_controls += 1
                if param not in var_keys:
                    score -= 8
                    critiques.append(f"Control '{c.get('label', c.get('id', 'unnamed'))}' references unknown param '{param}'. Must match a variable in variables.")
        if bound_controls == 0 and len(var_keys) > 0:
            score -= 15
            critiques.append("None of the interactive controls are bound to physics variables via 'param'.")

    # 5. Visual Scene Completeness
    visual_scene = spec.get("visual_scene", {})
    if not isinstance(visual_scene, dict):
        visual_scene = {}
    components = visual_scene.get("components", [])
    if not isinstance(components, list) or len(components) < 3:
        score -= 15
        critiques.append(f"Visual scene has only {len(components) if isinstance(components, list) else 0} component(s). Must have at least 3 distinct graphical elements (e.g. wave profile, barrier, particles, vectors).")

    # 6. Pedagogical Milestones
    callouts = spec.get("pedagogical_callouts", [])
    if not isinstance(callouts, list) or len(callouts) < 2:
        score -= 10
        critiques.append("Need at least 2 pedagogical callouts explaining the physical mechanism step-by-step.")

    score = max(0, min(100, score))
    is_valid = score >= 80 and len(critiques) == 0

    return {
        "score": score,
        "is_valid": is_valid,
        "critique": "\n".join(f"• {c}" for c in critiques) if critiques else "Specification is 100% valid and verified."
    }
