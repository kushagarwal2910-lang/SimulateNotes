import re

jsx_path = 'simulations/lithium_ion_battery_dynamics/LithiumIonBatteryDynamicsSimulation.jsx'
html_path = 'simulations/lithium_ion_battery_dynamics/preview.html'

with open(jsx_path, 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
if lines and lines[0].strip().lower() in ('jsx', 'javascript', 'tsx', 'js'):
    lines = lines[1:]

clean_code = '\n'.join(lines).strip()

with open(jsx_path, 'w', encoding='utf-8') as f:
    f.write(clean_code + '\n')

print('Cleaned LithiumIonBatteryDynamicsSimulation.jsx. Total lines:', len(lines))

# Re-generate preview.html
clean_babel = re.sub(r"import\s+.*?from\s+['\"].*?['\"];?", "", clean_code)
clean_babel = re.sub(r"export\s+default\s+function", "function", clean_babel)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lithium-Ion Battery: Intercalation & Rocking-Chair Electrochemistry</title>
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
      padding: 16px;
    }}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const {{ useState, useEffect, useRef, useMemo, useCallback }} = React;
    const gsap = window.gsap;

{clean_babel}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<LithiumIonBatteryDynamicsSimulation />);
  </script>
</body>
</html>
"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('Cleaned and rebuilt preview.html.')
