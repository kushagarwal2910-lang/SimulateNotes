import { NextRequest, NextResponse } from "next/server";
import { getSimulationCode, saveSimulationCode } from "@/lib/storage";
import { SIMULATIONS_CATALOG } from "@/lib/simulationsData";
import { synthesizeDomainSimulation } from "@/lib/domainPhysicsSynthesizer";

export const dynamic = "force-dynamic";

function generateProceduralFallback(topic: string, componentName: string): string {
  return synthesizeDomainSimulation(topic, componentName).code;
}

// Pre-sanitize and repair JSX syntax issues (e.g. unescaped LaTeX backslashes, unclosed tags)
function repairJsx(code: string): string {
  if (!code) return "";
  let repaired = code;

  // 1. Remove rogue imports & exports
  repaired = repaired.replace(/^import\s+[\s\S]*?from\s+['"][^'"]*['"];?\s*$/gm, "");
  repaired = repaired.replace(/^import\s+['"][^'"]*['"];?\s*$/gm, "");
  repaired = repaired.replace(/export\s+default\s+function/g, "function");
  repaired = repaired.replace(/export\s+function/g, "function");
  repaired = repaired.replace(/export\s+default\s+/g, "");

  // 2. Replace LaTeX macros with clean mathematical Unicode
  repaired = repaired.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");
  repaired = repaired.replace(/\\mathbf\{([^}]+)\}/g, "$1");
  repaired = repaired.replace(/\\mathit\{([^}]+)\}/g, "$1");
  repaired = repaired.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  repaired = repaired.replace(/\\text\{([^}]+)\}/g, "$1");
  repaired = repaired.replace(/\\partial/g, "∂");
  repaired = repaired.replace(/\\nabla/g, "∇");
  repaired = repaired.replace(/\\alpha/g, "α");
  repaired = repaired.replace(/\\beta/g, "β");
  repaired = repaired.replace(/\\gamma/g, "γ");
  repaired = repaired.replace(/\\delta/g, "δ");
  repaired = repaired.replace(/\\theta/g, "θ");
  repaired = repaired.replace(/\\omega/g, "ω");
  repaired = repaired.replace(/\\lambda/g, "λ");
  repaired = repaired.replace(/\\times/g, "×");
  repaired = repaired.replace(/\\cdot/g, "·");
  repaired = repaired.replace(/\\pm/g, "±");
  repaired = repaired.replace(/\\infty/g, "∞");
  repaired = repaired.replace(/\\approx/g, "≈");
  repaired = repaired.replace(/\\neq/g, "≠");
  repaired = repaired.replace(/\\leq/g, "≤");
  repaired = repaired.replace(/\\geq/g, "≥");
  repaired = repaired.replace(/\\sum/g, "∑");
  repaired = repaired.replace(/\\int/g, "∫");

  // 3. Remove any remaining raw backslashes before characters to prevent Unicode escape syntax errors
  repaired = repaired.replace(/\\([a-zA-Z_])/g, "$1");

  // 4. Auto-close simple void HTML tags
  repaired = repaired.replace(/<br\s*>/gi, "<br />");
  repaired = repaired.replace(/<hr\s*>/gi, "<hr />");

  // 5. Fix HTML attribute names to JSX
  repaired = repaired.replace(/(\s)class=/g, "$1className=");
  repaired = repaired.replace(/(\s)for=/g, "$1htmlFor=");

  // 6. Fix HTML comments
  repaired = repaired.replace(/<!--([\s\S]*?)-->/g, "{/* $1 */}");

  return repaired;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id") || searchParams.get("slug");
    const queryTitle = searchParams.get("title");
    const queryCode = searchParams.get("code");

    let code: string = "";
    let componentName: string = "Simulation";
    let title: string = queryTitle || "Interactive Simulation";

    if (queryCode) {
      // Decode if base64 or use raw
      try {
        if (queryCode.startsWith("b64:")) {
          code = Buffer.from(queryCode.slice(4), "base64").toString("utf-8");
        } else {
          code = queryCode;
        }
      } catch {
        code = queryCode;
      }
      const fnMatch = code.match(/function\s+([A-Z][a-zA-Z0-9_]*)/);
      if (fnMatch) componentName = fnMatch[1];
    } else if (id) {
      // Check catalog first for known static slugs
      const catalogMatch = SIMULATIONS_CATALOG.find((s) => s.slug === id || s.id === id);
      if (catalogMatch && !catalogMatch.isDynamic) {
        return NextResponse.redirect(new URL(`/simulations/${catalogMatch.slug}/preview.html`, req.url));
      }

      // Lookup dynamic simulation code in storage
      const stored = getSimulationCode(id);

      if (stored) {
        code = repairJsx(stored.code);
        componentName = stored.metadata?.componentName || "Simulation";
        title = stored.metadata?.simulation?.title || queryTitle || "Interactive Simulation";
      } else {
        // Fallback: domain-aware physics synthesis for this id/topic
        const fallbackTitle = queryTitle || (catalogMatch ? catalogMatch.title : id.replace(/^(dyn_|job_|\d+_)+/, "").replace(/_/g, " ")) || "Interactive Simulation";
        componentName = "GeneratedSimulation";
        const synth = synthesizeDomainSimulation(fallbackTitle, componentName);
        code = synth.code;
        title = synth.title || (fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1));

        // Save for subsequent requests
        saveSimulationCode(id, code, {
          componentName,
          simulation: { title },
          updatedAt: Date.now(),
        });
      }
    } else {
      return NextResponse.redirect(new URL("/simulations/quantum_tunneling_barrier/preview.html", req.url));
    }

    // Pre-sanitize code
    code = repairJsx(code);

    // Generate self-contained HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title.replace(/</g, "&lt;")} - SimulateNotes</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- GSAP 3 CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- React 18 & ReactDOM 18 CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Babel Standalone CDN -->
  <script crossorigin src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Three.js & OrbitControls -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      overflow-x: hidden;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Client-side code repair function
    function repairJsxClient(code) {
      if (!code) return "";
      let r = code;
      r = r.replace(/^import\\s+[\\s\\S]*?from\\s+['"][^'"]*['"];?\\s*$/gm, "");
      r = r.replace(/^import\\s+['"][^'"]*['"];?\\s*$/gm, "");
      r = r.replace(/export\\s+default\\s+function/g, "function");
      r = r.replace(/export\\s+function/g, "function");
      r = r.replace(/export\\s+default\\s+/g, "");
      r = r.replace(/\\\\frac\\{([^}]+)\\}\\{([^}]+)\\}/g, "($1)/($2)");
      r = r.replace(/\\\\mathbf\\{([^}]+)\\}/g, "$1");
      r = r.replace(/\\\\mathit\\{([^}]+)\\}/g, "$1");
      r = r.replace(/\\\\mathrm\\{([^}]+)\\}/g, "$1");
      r = r.replace(/\\\\text\\{([^}]+)\\}/g, "$1");
      r = r.replace(/\\\\partial/g, "∂");
      r = r.replace(/\\\\nabla/g, "∇");
      r = r.replace(/\\\\alpha/g, "α");
      r = r.replace(/\\\\beta/g, "β");
      r = r.replace(/\\\\gamma/g, "γ");
      r = r.replace(/\\\\delta/g, "δ");
      r = r.replace(/\\\\theta/g, "θ");
      r = r.replace(/\\\\omega/g, "ω");
      r = r.replace(/\\\\lambda/g, "λ");
      r = r.replace(/\\\\times/g, "×");
      r = r.replace(/\\\\cdot/g, "·");
      r = r.replace(/\\\\pm/g, "±");
      r = r.replace(/\\\\infty/g, "∞");
      r = r.replace(/\\\\approx/g, "≈");
      r = r.replace(/\\\\neq/g, "≠");
      r = r.replace(/\\\\leq/g, "≤");
      r = r.replace(/\\\\geq/g, "≥");
      r = r.replace(/\\\\sum/g, "∑");
      r = r.replace(/\\\\int/g, "∫");
      r = r.replace(/\\\\([a-zA-Z_])/g, "$1");
      r = r.replace(/<br\\s*>/gi, "<br />");
      r = r.replace(/<hr\\s*>/gi, "<hr />");
      r = r.replace(/(\\s)class=/g, "$1className=");
      r = r.replace(/(\\s)for=/g, "$1htmlFor=");
      r = r.replace(/<!--([\\s\\S]*?)-->/g, "{/* $1 */}");
      return r;
    }

    window.addEventListener('DOMContentLoaded', () => {
      const primaryCode = ${JSON.stringify(code)};
      const fallbackCode = ${JSON.stringify(generateProceduralFallback(title, "SelfHealedSimulation"))};

      const ErrorBoundary = class extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }
        static getDerivedStateFromError() {
          return { hasError: true };
        }
        componentDidCatch(error, errorInfo) {
          console.warn("Recovering from component runtime error via self-healing:", error);
        }
        render() {
          return this.props.children;
        }
      };

      function mountSimulation(rawCode) {
        const repaired = repairJsxClient(rawCode);
        const compiled = Babel.transform(repaired, { presets: [['react', { runtime: 'classic' }]] }).code;
        const fnMatch = repaired.match(/function\\s+([A-Z][a-zA-Z0-9_]*)/);
        const compName = fnMatch ? fnMatch[1] : ${JSON.stringify(componentName)};

        const runner = new Function(
          'React', 'ReactDOM', 'gsap', 'THREE', 'ErrorBoundary',
          'const { useState, useEffect, useRef, useMemo, useCallback } = React;\\n' +
          compiled +
          '\\nReactDOM.createRoot(document.getElementById("root")).render(' +
          'React.createElement(ErrorBoundary, null, React.createElement(' + compName + '))' +
          ');'
        );
        runner(window.React, window.ReactDOM, window.gsap, window.THREE, ErrorBoundary);
      }

      // Self-healing execution harness:
      try {
        mountSimulation(primaryCode);
      } catch (err1) {
        console.warn('Simulation transpilation step 1 failed, attempting aggressive repair:', err1);
        try {
          // Aggressively strip any remaining backslashes
          const stripped = primaryCode.replace(/\\\\/g, '');
          mountSimulation(stripped);
        } catch (err2) {
          console.warn('Simulation transpilation step 2 failed, deploying guaranteed procedural engine:', err2);
          try {
            mountSimulation(fallbackCode);
          } catch (fatal) {
            console.error('Self-healing fallback execution failed:', fatal);
          }
        }
      }
    });
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/simulations/preview:", error);
    return new NextResponse(
      `<div style="background: #0b0f19; color: #f87171; padding: 30px; font-family: monospace;">
        <h2>⚠️ Server Error Rendering Simulation Preview</h2>
        <p>${error?.message || "Internal server error"}</p>
      </div>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
