import json
import os
import re
import requests
import time

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL_NAME = "nvidia/nemotron-3-super-120b-a12b:free"
ORIGINAL_JSX = "BernoulliSimulation.jsx"
FIXED_JSX = "BernoulliSimulation.jsx"
OUTPUT_HTML = "preview.html"

with open(ORIGINAL_JSX, "r", encoding="utf-8") as f:
    broken_code = f.read()

CRITIQUE_PROMPT = """You are the Lead React & GSAP Architect performing Code Verification and Automated Healing.

Here is the simulation code you generated earlier:
```jsx
""" + broken_code + """
```

We ran automated verification and identified the following critical syntax and rendering issues that MUST be fixed:

1. FATAL REACT JSX ERROR (Objects are not valid as a React child):
   - In lines where velocity arrows were rendered, you wrote:
     `const line = document.createElementNS(...); return (<g>{line}{head}</g>);`
     This crashes React immediately with 'Objects are not valid as a React child'!
   - FIX: Render pure declarative JSX elements directly:
     `<line ref={(el) => (arrowRefs.current[i] = el)} x1={...} y1={...} x2={...} y2={...} stroke={...} strokeWidth="3" />`
     `<polygon points={...} fill={...} />`

2. MANOMETER REFS MAP BUG:
   - You wrote `manometerRefs.current.map((ref, i) => ...)`. Because `manometerRefs.current` starts as an empty array `[]`, this never renders anything!
   - FIX: Map over the 3 tube configurations `[0, 1, 2].map((i) => <rect ref={(el) => (manometerRefs.current[i] = el)} ... />)` or manage them with state / declarative heights.

3. PARTICLE RENDERING:
   - Rather than imperatively calling `svg.appendChild(circle)`, maintain particle positions in React state or use an HTML5 `<canvas>` or render an array of SVG `<circle>` elements declaratively updated via GSAP or requestAnimationFrame.

4. SVG COORDINATES & SCALING:
   - For pipe dimensions: `y={250 - (d1 * 500) / 2}` and `height={d1 * 500}` so the pipe is vertically centered around y=250.
   - Throat height is `(d1 * d2Ratio) * 500` centered at `250 - ((d1 * d2Ratio) * 500) / 2`.
   - The manometer tubes connect directly to the top edge of the pipe.

5. POLISHED HIGH-END AESTHETICS:
   - Dark theme `#0b0f19`.
   - Glowing venturi pipe gradient and streamline paths.
   - Clean UI control panel with sliders, fluid selector, and buttons.
   - Beautiful telemetry HUD with speed, pressure, and delta P badges.
   - Energy conservation live visual bar.
   - Pedagogical callouts.

Refactor and output the 100% complete, fully working, self-contained React component `BernoulliSimulation`. Output ONLY the jsx code block.
"""

print("[*] Sending critique to Nemotron for self-healing...")
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://github.com/langgraph-nemotron-simulation",
    "X-Title": "LangGraph Simulation Healing"
}

payload = {
    "model": MODEL_NAME,
    "messages": [
        {"role": "user", "content": CRITIQUE_PROMPT}
    ],
    "temperature": 0.2,
    "max_tokens": 12000
}

start = time.time()
res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=180)
print(f"[*] Response received in {time.time() - start:.2f}s. Status: {res.status_code}")

if res.status_code == 200:
    content = res.json()["choices"][0]["message"]["content"]
    match = re.search(r"```(?:jsx|javascript|tsx|react)?\s*([\s\S]*?)```", content)
    fixed_code = match.group(1).strip() if match else content.strip()

    with open(FIXED_JSX, "w", encoding="utf-8") as f:
        f.write(fixed_code)
    print(f"[+] Saved fixed JSX to {FIXED_JSX} ({len(fixed_code)} chars).")

    # Update preview.html
    clean_code = re.sub(r"import\s+.*?from\s+['\"].*?['\"];?", "", fixed_code)
    clean_code = re.sub(r"export\s+default\s+function", "function", clean_code)

    html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bernoulli's Principle - Interactive GSAP Simulation</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 10px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const gsap = window.gsap;

""" + clean_code + """

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<BernoulliSimulation />);
  </script>
</body>
</html>
"""
    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[+] Saved updated {OUTPUT_HTML}.")
else:
    print("[!] Error:", res.text)
