import json
import os
import re
import sys
import requests
import time

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL_NAME = "nvidia/nemotron-3-super-120b-a12b:free"
PROMPT_FILE = "bernoulli_simulation_prompt.json"
OUTPUT_JSX = "BernoulliSimulation.jsx"
OUTPUT_HTML = "preview.html"

def load_prompt():
    with open(PROMPT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

SYSTEM_PROMPT = """You are an elite Creative Technologist, Physicist, and Senior React & GSAP Engineer.
Your specialty is building world-class, breathtaking, interactive physics simulations in React and GSAP.

You will be provided with a strictly specified JSON prompt detailing a physics simulation.
Your mission is to write a 100% complete, working, high-fidelity, top-notch React component using GSAP that faithfully implements every single directive in the JSON.

CRITICAL IMPLEMENTATION RULES:
1. STRICT JSON ADHERENCE:
   - Implement all physics equations, variables, derived formulas, and conservation laws.
   - Implement all visual elements (Venturi tube geometry, manometer glass tubes, dynamic fluid particles, streamlines, velocity vector arrows, energy conservation bars).
   - Implement all interactive sliders, selectors, and playback controls.
   - Implement all telemetry metrics cards and educational callout cards.
2. GSAP BEST PRACTICES:
   - Use `useRef` for container and SVG/DOM references.
   - Manage animations inside `useEffect` with `gsap.context(() => { ... }, containerRef)` and ensure clean disposal in the return cleanup function `ctx.revert()`.
   - For fluid particles, create a fluid, continuous, stutter-free flow where particles accelerate through the constriction and decelerate in the wide sections.
   - Tween manometer levels, gauges, and vectors smoothly with `gsap.to()` when user changes sliders.
3. VISUAL EXCELLENCE & AESTHETICS:
   - Ultra-modern dark laboratory aesthetic (#0b0f19 background, subtle glows, glassmorphism cards, crisp typography, clean SVG vector graphics).
   - Highly responsive, clean layout with side-by-side or stacked simulation canvas and control HUD.
4. DEPENDENCY & CODE COMPLETENESS:
   - Write standard React 18 (using hooks: useState, useEffect, useRef, useMemo, useCallback).
   - Use standard GSAP (`import gsap from 'gsap'` or global `window.gsap` fallback).
   - DO NOT use external icon packages (like lucide-react or react-icons). Use clean inline SVGs for all icons so the component works standalone anywhere without missing npm packages.
   - Provide the complete, working code inside a single ```jsx ... ``` code fence with `export default function BernoulliSimulation()`. Do not leave placeholders, TODOs, or truncated snippets.
"""

def generate_simulation():
    print(f"[*] Reading JSON prompt from {PROMPT_FILE}...")
    prompt_data = load_prompt()
    json_str = json.dumps(prompt_data, indent=2)

    user_message = f"""Here is the directed JSON scene specification for the simulation:

<SIMULATION_JSON_SPEC>
{json_str}
</SIMULATION_JSON_SPEC>

Generate the complete, top-notch, production-grade React + GSAP simulation component that fulfills this specification completely and strictly. Output only the JSX code block."""

    print(f"[*] Dispatching request to OpenRouter model '{MODEL_NAME}'...")
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/langgraph-nemotron-simulation",
        "X-Title": "LangGraph Simulation Generator"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2,
        "max_tokens": 12000
    }

    start_time = time.time()
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=180
        )
    except Exception as e:
        print(f"[!] Request failed: {e}")
        return False

    elapsed = time.time() - start_time
    print(f"[*] Received response in {elapsed:.2f} seconds. Status code: {response.status_code}")

    if response.status_code != 200:
        print(f"[!] Error: {response.text}")
        return False

    res_json = response.json()
    content = res_json["choices"][0]["message"]["content"]
    print(f"[*] Raw response length: {len(content)} characters.")

    # Extract JSX code block
    code_match = re.search(r"```(?:jsx|javascript|tsx|react)?\s*([\s\S]*?)```", content)
    if code_match:
        jsx_code = code_match.group(1).strip()
    else:
        jsx_code = content.strip()

    # Save JSX file
    with open(OUTPUT_JSX, "w", encoding="utf-8") as f:
        f.write(jsx_code)
    print(f"[+] Saved React component to {OUTPUT_JSX} ({len(jsx_code)} characters).")

    # Create standalone HTML preview harness
    create_html_preview(jsx_code)
    return True

def create_html_preview(jsx_code):
    # Prepare JSX for standalone in-browser Babel execution
    # Strip any import statements from JSX so Babel can execute directly with window globals
    clean_code = re.sub(r"import\s+.*?from\s+['\"].*?['\"];?", "", jsx_code)
    clean_code = re.sub(r"export\s+default\s+function", "function", clean_code)
    
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bernoulli's Principle - Interactive GSAP Simulation</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- GSAP 3 CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- React & ReactDOM 18 CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Babel Standalone CDN for in-browser JSX compilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {{
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }}
    /* Custom glassmorphism scrollbar */
    ::-webkit-scrollbar {{
      width: 8px;
    }}
    ::-webkit-scrollbar-track {{
      background: #0b0f19;
    }}
    ::-webkit-scrollbar-thumb {{
      background: #1e293b;
      border-radius: 4px;
    }}
    ::-webkit-scrollbar-thumb:hover {{
      background: #334155;
    }}
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const {{ useState, useEffect, useRef, useMemo, useCallback }} = React;
    const gsap = window.gsap;

    {clean_code}

    // Mount to root
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<BernoulliSimulation />);
  </script>
</body>
</html>
"""
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"[+] Saved standalone HTML preview to {OUTPUT_HTML}.")

if __name__ == "__main__":
    generate_simulation()
