import React, { useState, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function VenturiEffectBernoulliPrincipleSimulation() {
  const [inletDiameter, setInletDiameter] = useState(0.1);
  const [throatDiameter, setThroatDiameter] = useState(0.05);
  const [inletVelocity, setInletVelocity] = useState(1.0);
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [pipeLength, setPipeLength] = useState(2.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const streamlineRefs = useRef(Array(5).fill(null));
  const vectorRefs = useRef({ inlet: [], throat: [], outlet: [] });
  const manometerRefs = useRef({ inlet: null, throat: null });
  const gradientRef = useRef(null);

  const inletArea = useMemo(() => Math.PI * Math.pow(inletDiameter / 2, 2), [inletDiameter]);
  const throatArea = useMemo(() => Math.PI * Math.pow(throatDiameter / 2, 2), [throatDiameter]);
  const throatVelocity = useMemo(() => inletVelocity * (inletArea / throatArea), [inletVelocity, inletArea, throatArea]);
  const pressureDrop = useMemo(() => 0.5 * fluidDensity * (Math.pow(throatVelocity, 2) - Math.pow(inletVelocity, 2)), [fluidDensity, throatVelocity, inletVelocity]);
  const flowRate = useMemo(() => inletArea * inletVelocity, [inletArea, inletVelocity]);
  const throatPressure = useMemo(() => 101325 - pressureDrop, [pressureDrop]);

  const venturiPath = useMemo(() => {
    const w = 920, h = 380;
    const inletX = 50, throatX = w * 0.4, outletX = w - 50;
    const inletY = h / 2;
    const throatY = inletY - 80;
    return `M ${inletX},${inletY} Q ${(inletX + throatX) / 2},${throatY} ${throatX},${inletY} T ${outletX},${inletY}`;
  }, [inletDiameter, throatDiameter]);

  const streamlinePaths = useMemo(() => {
    const w = 920, h = 380;
    const yPoints = [120, 160, 200, 240, 280];
    return yPoints.map((y, i) => {
      const inletX = 50, throatX = w * 0.4, outletX = w - 50;
      const inletY = y;
      const throatY = inletY - (y - h / 2) * 0.4;
      return `M ${inletX},${inletY} C ${(inletX + throatX) * 0.3},${inletY} ${(inletX + throatX) * 0.7},${throatY} ${throatX},${throatY} C ${(throatX + outletX) * 0.3},${throatY} ${(throatX + outletX) * 0.7},${inletY} ${outletX},${inletY}`;
    });
  }, [inletDiameter, throatDiameter]);

  const pressureGradientHeight = useMemo(() => {
    const maxHeight = 200;
    const pressureRatio = (throatPressure - 0) / (101325 - 0);
    return Math.max(10, Math.min(maxHeight, maxHeight * pressureRatio));
  }, [throatPressure]);

  const manometerHeights = useMemo(() => {
    const scale = 0.002;
    return {
      inlet: Math.max(10, Math.min(180, inletVelocity * 100 * scale)),
      throat: Math.max(10, Math.min(180, throatVelocity * 100 * scale))
    };
  }, [inletVelocity, throatVelocity]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tick = () => {
        if (isPlaying) {
          streamlineRefs.current.forEach((ref, i) => {
            if (ref) {
              gsap.to(ref, {
                strokeDashoffset: "-=2",
                duration: 0.01,
                ease: "none"
              });
            }
          });
          Object.values(vectorRefs.current).forEach(vectors => {
            vectors.forEach((ref, idx) => {
              if (ref) {
                gsap.to(ref, {
                  opacity: 0.5 + 0.5 * Math.sin(Date.now() * 0.002 + idx),
                  duration: 0.1,
                  ease: "none"
                });
              }
            });
          });
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, {});
    return () => ctx.revert();
  }, [isPlaying]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setInletDiameter(0.1);
    setThroatDiameter(0.05);
    setInletVelocity(1.0);
    setFluidDensity(1000);
    setPipeLength(2.0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Venturi Effect: Throat Velocity Increase and Pressure Drop</h1>
        <p className="text-sm text-gray-400">Demonstrating Bernoulli's Principle and Continuity Equation in Fluid Dynamics</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-300">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="font-medium mb-1">Inlet Velocity</div>
          <div className="text-lg font-semibold">{inletVelocity.toFixed(2)} m/s</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="font-medium mb-1">Throat Velocity</div>
          <div className="text-lg font-semibold">{throatVelocity.toFixed(2)} m/s</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="font-medium mb-1">Pressure Drop (ΔP)</div>
          <div className="text-lg font-semibold">{pressureDrop.toFixed(0)} Pa</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="font-medium mb-1">Flow Rate (Q)</div>
          <div className="text-lg font-semibold">{flowRate.toFixed(4)} m³/s</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="font-medium mb-1">Throat Pressure</div>
          <div className="text-lg font-semibold">{throatPressure.toFixed(0)} Pa</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="font-medium mb-1">Velocity Ratio (v₂/v₁)</div>
          <div className="text-lg font-semibold">{(throatVelocity / inletVelocity).toFixed(2)}</div>
        </div>
      </div>

      <div className="relative w-full h-[500px] min-h-[500px] bg-gray-900/80 rounded-xl overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 920 380" style={{ backgroundColor: "#0b0f19" }}>
          <defs>
            <linearGradient id="pressureGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.5" />
            </filter>
          </defs>

          <rect x="20" y={140} width="20" height={pressureGradientHeight} fill="url(#pressureGrad)" filter="url(#glow)" />

          <path d={venturiPath} stroke="#38bdf8" strokeWidth="4" fill="none" />

          {streamlinePaths.map((path, i) => (
            <path
              key={i}
              ref={(ref) => (streamlineRefs.current[i] = ref)}
              d={path}
              stroke="#34d399"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8,4"
              strokeDashoffset={Math.random() * 20}
            />
          ))}

          <g ref={(ref) => (vectorRefs.current.inlet = [ref])}>
            <line x1="80" y1="240" x2="120" y2="240" stroke="#34d399" strokeWidth="3" />
            <polyline points="115,235 120,240 115,245" fill="none" stroke="#34d399" strokeWidth="2" />
          </g>

          <g ref={(ref) => (vectorRefs.current.throat = [ref])}>
            <line x1="420" y1="160" x2="480" y2="160" stroke="#34d399" strokeWidth="5" />
            <polyline points="475,155 480,160 475,165" fill="none" stroke="#34d399" strokeWidth="2" />
          </g>

          <g ref={(ref) => (vectorRefs.current.outlet = [ref])}>
            <line x1="820" y1="200" x2="860" y2="200" stroke="#34d399" strokeWidth="4" />
            <polyline points="855,195 860,200 855,205" fill="none" stroke="#34d399" strokeWidth="2" />
          </g>

          <g>
            <rect x="480" y={180 - manometerHeights.inlet} width="20" height={manometerHeights.inlet} fill="#f43f5e" />
            <rect x="480" y="180" width="20" height="180" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <text x="490" y="175" fontSize="10" fill="#e2e8f0">Inlet</text>
          </g>

          <g>
            <rect x="300" y={180 - manometerHeights.throat} width="20" height={manometerHeights.throat} fill="#f43f5e" />
            <rect x="300" y="180" width="20" height="180" fill="none" stroke="#e2e8f0" strokeWidth="2" />
            <text x="310" y="175" fontSize="10" fill="#e2e8f0">Throat</text>
          </g>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Inlet Pipe Diameter (m)</label>
            <input
              type="range"
              min="0.05"
              max="0.2"
              step="0.01"
              value={inletDiameter}
              onChange={(e) => setInletDiameter(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.05</span>
              <span>0.20</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Throat Diameter (m)</label>
            <input
              type="range"
              min="0.01"
              max="0.09"
              step="0.005"
              value={throatDiameter}
              onChange={(e) => setThroatDiameter(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.01</span>
              <span>0.09</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Inlet Flow Velocity (m/s)</label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={inletVelocity}
              onChange={(e) => setInletVelocity(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.1</span>
              <span>5.0</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Fluid Density (kg/m³)</label>
            <input
              type="range"
              min="500"
              max="2000"
              step="50"
              value={fluidDensity}
              onChange={(e) => setFluidDensity(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>500</span>
              <span>2000</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white mb-2">Pedagogical Insights</h2>
        <div className="grid grid-cols-1 gap-3 text-sm text-gray-300 bg-gray-800/50 rounded-lg p-4">
          <div className="border-l-4 border-l-primary pl-3">
            <h3 className="font-medium text-white mb-1">1. Continuity in Action</h3>
            <p>As fluid enters the constricted throat, its cross-sectional area decreases. To maintain constant mass flow rate (A₁v₁ = A₂v₂), the fluid velocity must increase.</p>
          </div>
          <div className="border-l-4 border-l-secondary pl-3">
            <h3 className="font-medium text-white mb-1">2. Bernoulli's Energy Trade-off</h3>
            <p>The increase in kinetic energy (½ρv²) in the throat must be balanced by a decrease in pressure energy (P), assuming negligible height change. This causes the pressure drop observed in the manometer tubes.</p>
          </div>
          <div className="border-l-4 border-l-accent pl-3">
            <h3 className="font-medium text-white mb-1">3. Venturi Meter Principle</h3>
            <p>The pressure difference (ΔP) between inlet and throat is proportional to the square of the flow rate. By measuring ΔP, the flow rate can be calculated without moving parts, forming the basis of Venturi flow meters.</p>
          </div>
          <div className="border-l-4 border-l-primary pl-3">
            <h3 className="font-medium text-white mb-1">4. Real-World Applications</h3>
            <p>This principle is used in carburetors (fuel injection), aspirators, medical nebulizers, and industrial flow measurement. The geometry ensures efficient energy conversion with minimal losses compared to abrupt orifices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
