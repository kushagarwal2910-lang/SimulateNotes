import re

with open('preview.html', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'<script type="text/babel">([\s\S]*?)</script>', content)
if m:
    code = m.group(1)
    print("Script extracted. Length:", len(code))
    print("Curly braces:", code.count('{'), "open vs", code.count('}'), "closed")
    print("Parentheses:", code.count('('), "open vs", code.count(')'), "closed")
    print("Square brackets:", code.count('['), "open vs", code.count(']'), "closed")
    
    # Check for any obvious syntax anomalies
    if code.count('{') == code.count('}') and code.count('(') == code.count(')'):
        print("Syntax balance test: PASSED (Perfect match)")
    else:
        print("Warning: syntax balance mismatch detected")
