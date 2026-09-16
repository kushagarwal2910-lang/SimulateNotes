import re

with open('BernoulliSimulation.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Strip markdown fences if present
lines = text.splitlines()
if lines and lines[0].startswith('```'):
    lines = lines[1:]
if lines and lines[-1].startswith('```'):
    lines = lines[:-1]

text = '\n'.join(lines)

# If truncated at the pedagogical callouts paragraph
if not text.rstrip().endswith('}'):
    # Look for truncated paragraph
    cut_marker = 'color: #e5e7eb", marginTop: "12px" }}>'
    pos = text.rfind('<p style={{ fontSize: "14px", lineHeight: "1.5", color:')
    if pos != -1:
        text = text[:pos] + """<p style={{ fontSize: "14px", lineHeight: "1.5", color: "#e5e7eb", marginTop: "12px" }}>
          Look at the vertical glass tubes: The liquid column above the constricted throat drops lower than the inlet! This physical drop proves the pressure in the fast-moving fluid has plummeted.
        </p>
      </div>
    </div>
  );
}"""

with open('BernoulliSimulation.jsx', 'w', encoding='utf-8') as f:
    f.write(text.strip() + '\n')

print("BernoulliSimulation.jsx formatted successfully.")

# Now rebuild preview.html
clean_code = re.sub(r"import\s+.*?from\s+['\"].*?['\"];?", "", text)
clean_code = re.sub(r"export\s+default\s+function", "function", clean_code)

html = f"""<!DOCTYPE html>
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
    body {{
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 10px;
    }}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const {{ useState, useEffect, useRef, useMemo, useCallback }} = React;
    const gsap = window.gsap;

{clean_code}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<BernoulliSimulation />);
  </script>
</body>
</html>
"""

with open('preview.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("preview.html rebuilt successfully.")
