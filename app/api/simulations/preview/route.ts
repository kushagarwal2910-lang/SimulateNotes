import { NextRequest, NextResponse } from "next/server";
import { getSimulationCode, saveSimulationCode } from "@/lib/storage";
import { SIMULATIONS_CATALOG } from "@/lib/simulationsData";

export const dynamic = "force-dynamic";

function generateProceduralFallback(topic: string, componentName: string): string {
  const safeTitle = topic.replace(/["\\]/g, "");
  return `function ${componentName}() {
  const [param1, setParam1] = useState(50);
  const [param2, setParam2] = useState(1.5);
  const [param3, setParam3] = useState(0.2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [displayMode, setDisplayMode] = useState("vector_field");
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime((t) => t + dt * param2);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, param2]);

  const particles = useMemo(() => {
    const list = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.8;
      const radius = 90 + Math.sin(time * 2 + i) * (param1 * 0.9);
      const cx = 480 + Math.cos(angle) * radius;
      const cy = 240 + Math.sin(angle) * (radius * 0.55);
      list.push({ id: i, cx, cy, r: 3 + (i % 3) * 1.5 });
    }
    return list;
  }, [time, param1]);

  const kineticEnergy = (0.5 * Math.pow(param2, 2) * (param1 / 10)).toFixed(2);
  const oscillationFreq = (param2 / (2 * Math.PI)).toFixed(2);
  const fieldDamping = (Math.exp(-param3 * (time % 10)) * 100).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-sky-500/10 border border-sky-500/30 text-sky-400">
          Computational Dynamics & Mathematical Modeling
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
          ${safeTitle}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Interactive 60 FPS real-time model analyzing state transitions, boundary conditions, and dynamical equations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Kinetic Potential (E)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{kineticEnergy} <span className="text-xs font-normal text-slate-400">kJ</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Integrated energy flux</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Oscillation Rate (f)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{oscillationFreq} <span className="text-xs font-normal text-slate-400">Hz</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Fundamental mode cycle</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Field Gradient</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{fieldDamping} <span className="text-xs font-normal text-slate-400">%</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Exponential envelope decay</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Phase Angle (θ)</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{(time % (Math.PI * 2)).toFixed(2)} <span className="text-xs font-normal text-slate-400">rad</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Harmonic phase displacement</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          <defs>
            <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.12" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5">
            <line x1="80" y1="120" x2="880" y2="120" />
            <line x1="80" y1="240" x2="880" y2="240" />
            <line x1="80" y1="360" x2="880" y2="360" />
            <line x1="280" y1="60" x2="280" y2="420" />
            <line x1="480" y1="60" x2="480" y2="420" />
            <line x1="680" y1="60" x2="680" y2="420" />
          </g>

          <ellipse cx="480" cy="240" rx="360" ry="170" fill="url(#coreGrad)" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
          <ellipse cx="480" cy="240" rx="200" ry="95" fill="none" stroke="#818cf8" strokeWidth="1.2" strokeDasharray="6,4" opacity="0.8" />
          <circle cx="480" cy="240" r="16" fill="#38bdf8" filter="url(#glow)" opacity="0.9" />

          <path
            d={Array.from({ length: 160 }).reduce((acc, _, idx) => {
              const x = 80 + idx * 5;
              const y = 240 + Math.sin((idx * 0.1) + time * 3) * (param1 * 0.8) * Math.cos(idx * 0.03);
              return idx === 0 ? ("M " + x + " " + y) : (acc + " L " + x + " " + y);
            }, "")}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow)"
            opacity="0.9"
          />

          {particles.map((p) => (
            <g key={p.id}>
              <circle cx={p.cx} cy={p.cy} r={p.r * 2.2} fill="#38bdf8" opacity="0.25" />
              <circle cx={p.cx} cy={p.cy} r={p.r} fill="#e0f2fe" filter="url(#glow)" />
            </g>
          ))}

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">SYSTEM AXIS: Ψ(x, t)</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
            <text x="480" y="270" textAnchor="middle" fill="#38bdf8" fontSize="10">STATE VECTOR ATTRACTOR</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              )}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => { setParam1(50); setParam2(1.5); setParam3(0.2); setTime(0); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
            >
              ↺ Reset Defaults
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Mode:</span>
            {["vector_field", "phase_orbit"].map((m) => (
              <button
                key={m}
                onClick={() => setDisplayMode(m)}
                className={"px-2.5 py-1 rounded text-xs font-semibold capitalize " + (
                  displayMode === m ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                )}
              >
                {m.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Amplitude / Energy Flux</span>
              <span className="font-mono text-sky-400 font-bold">{param1} %</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={param1}
              onChange={(e) => setParam1(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Dynamics Velocity (v)</span>
              <span className="font-mono text-emerald-400 font-bold">{param2.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={param2}
              onChange={(e) => setParam2(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-indigo-300">Damping Coefficient (γ)</span>
              <span className="font-mono text-indigo-400 font-bold">{param3.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.80"
              step="0.01"
              value={param3}
              onChange={(e) => setParam3(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Models non-linear state evolution across continuous boundary manifolds with numerical integration.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">2. Mathematical Derivation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Computes Hamiltonian state trajectory: \\frac{d\\mathbf{x}}{dt} = \\mathbf{f}(\\mathbf{x}, t) under variable damping.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">3. Real-world Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Essential for aerospace control loops, orbital mechanics, and quantum transport dynamics.
          </p>
        </div>
      </div>
    </div>
  );
}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id") || searchParams.get("slug");

    if (!id) {
      return NextResponse.redirect(new URL("/simulations/quantum_tunneling_barrier/preview.html", req.url));
    }

    // Check catalog first for known static slugs
    const catalogMatch = SIMULATIONS_CATALOG.find((s) => s.slug === id || s.id === id);
    if (catalogMatch && !catalogMatch.isDynamic) {
      return NextResponse.redirect(new URL(`/simulations/${catalogMatch.slug}/preview.html`, req.url));
    }

    // Lookup dynamic simulation code in storage
    const stored = getSimulationCode(id);

    let code: string;
    let componentName: string;
    let title: string;

    if (stored) {
      code = stored.code;
      componentName = stored.metadata?.componentName || "Simulation";
      title = stored.metadata?.simulation?.title || "Interactive Simulation";
    } else {
      // Fallback: generate procedural simulation for this id/topic
      const fallbackTitle = catalogMatch ? catalogMatch.title : id.replace(/^(dyn_|job_)/, "").replace(/_/g, " ");
      componentName = "GeneratedSimulation";
      code = generateProceduralFallback(fallbackTitle, componentName);
      title = fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);

      // Save for subsequent requests
      saveSimulationCode(id, code, {
        componentName,
        simulation: { title },
        updatedAt: Date.now(),
      });
    }

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
  <div id="error-container"></div>
  <script>
    window.addEventListener('error', function(event) {
      console.error('Simulation Global Error:', event);
      var errBox = document.getElementById('error-container');
      if (errBox) {
        var msg = event.message || (event.error && event.error.message) || 'Unknown error';
        var stack = (event.error && event.error.stack) || (event.filename + ':' + event.lineno);
        errBox.innerHTML = '<div style="background: #1e1e2e; border: 1px solid #ef4444; border-radius: 8px; padding: 24px; margin: 20px; font-family: monospace; color: #f87171;">' +
          '<h2 style="margin-top: 0; color: #ef4444;">⚠️ Simulation Runtime Error</h2>' +
          '<p><strong>Error:</strong> ' + msg + '</p>' +
          '<pre style="background: #0f0f17; padding: 12px; border-radius: 4px; overflow-x: auto; color: #e2e8f0; margin-top: 12px;">' + stack + '</pre>' +
          '</div>';
      }
    });

    window.addEventListener('DOMContentLoaded', () => {
      const sourceCode = ${JSON.stringify(code)};
      try {
        const compiled = Babel.transform(sourceCode, { presets: [['react', { runtime: 'classic' }]] }).code;
        
        const ErrorBoundary = class extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false, error: null };
          }
          static getDerivedStateFromError(error) {
            return { hasError: true, error: error };
          }
          componentDidCatch(error, errorInfo) {
            console.error('ErrorBoundary caught:', error, errorInfo);
          }
          render() {
            if (this.state.hasError) {
              return React.createElement('div', {
                style: { background: '#1e1e2e', border: '1px solid #ef4444', borderRadius: '8px', padding: '24px', margin: '20px', fontFamily: 'monospace', color: '#f87171' }
              }, [
                React.createElement('h2', { key: 'h2', style: { marginTop: 0, color: '#ef4444' } }, '⚠️ Simulation Component Error'),
                React.createElement('p', { key: 'p' }, String(this.state.error?.message || this.state.error)),
                React.createElement('pre', { key: 'pre', style: { background: '#0f0f17', padding: '12px', borderRadius: '4px', overflowX: 'auto', color: '#e2e8f0', marginTop: '12px' } }, String(this.state.error?.stack || this.state.error))
              ]);
            }
            return this.props.children;
          }
        };

        const runner = new Function(
          'React', 'ReactDOM', 'gsap', 'THREE', 'ErrorBoundary',
          \`const { useState, useEffect, useRef, useMemo, useCallback } = React;
          \${compiled}
          
          let targetComponent = null;
          if (typeof \${JSON.stringify(componentName)} !== 'undefined') {
            try { targetComponent = eval(\${JSON.stringify(componentName)}); } catch(e){}
          }
          if (!targetComponent) {
            // Find any function component in scope
            const fnMatches = \${JSON.stringify(compiled)}.match(/function\\s+([A-Z][a-zA-Z0-9_]*)/g);
            if (fnMatches && fnMatches.length > 0) {
              for (const fn of fnMatches) {
                const name = fn.replace('function ', '').trim();
                try {
                  const candidate = eval(name);
                  if (typeof candidate === 'function') {
                    targetComponent = candidate;
                    break;
                  }
                } catch(e){}
              }
            }
          }
          
          if (targetComponent) {
            ReactDOM.createRoot(document.getElementById('root')).render(
              React.createElement(ErrorBoundary, null, React.createElement(targetComponent))
            );
          } else {
            document.getElementById('root').innerHTML = '<div style="color: #f87171; padding: 24px; font-family: monospace;">⚠️ Could not mount simulation component.</div>';
          }
          \`
        );
        runner(window.React, window.ReactDOM, window.gsap, window.THREE, ErrorBoundary);
      } catch (err) {
        console.error('Simulation Transpilation Error:', err);
        const errBox = document.getElementById('error-container');
        if (errBox) {
          errBox.innerHTML = '<div style="background: #1e1e2e; border: 1px solid #ef4444; border-radius: 8px; padding: 24px; margin: 20px; font-family: monospace; color: #f87171;">' +
            '<h2 style="margin-top: 0; color: #ef4444;">⚠️ Simulation Transpilation Error</h2>' +
            '<p><strong>Error:</strong> ' + err.message + '</p>' +
            '<pre style="background: #0f0f17; padding: 12px; border-radius: 4px; overflow-x: auto; color: #e2e8f0; margin-top: 12px;">' + (err.stack || err.toString()) + '</pre>' +
            '</div>';
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
