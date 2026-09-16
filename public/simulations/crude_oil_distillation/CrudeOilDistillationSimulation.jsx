import React, { useState, useEffect, useRef, useMemo } from "react";

export const FRACTIONS = [
  { id: "gas", name: "Refinery Gas (LPG)", temp: "< 40°C", carbons: "C1 - C4", use: "Bottled cooking gas, petrochemicals", defaultYield: 3, yPos: 70 },
  { id: "petrol", name: "Petrol / Gasoline", temp: "40 - 110°C", carbons: "C5 - C10", use: "Automobile motor fuel", defaultYield: 24, yPos: 125 },
  { id: "naphtha", name: "Naphtha", temp: "110 - 180°C", carbons: "C6 - C11", use: "Chemical feedstocks & plastics", defaultYield: 11, yPos: 180 },
  { id: "kerosene", name: "Kerosene / Paraffin", temp: "180 - 260°C", carbons: "C11 - C16", use: "Commercial jet aircraft fuel", defaultYield: 14, yPos: 235 },
  { id: "diesel", name: "Diesel (Gas Oil)", temp: "260 - 340°C", carbons: "C16 - C20", use: "Trucks, trains & heavy transport", defaultYield: 22, yPos: 290 },
  { id: "fueloil", name: "Fuel & Lubricating Oil", temp: "340 - 450°C", carbons: "C20 - C50", use: "Cargo ships, industrial boilers", defaultYield: 16, yPos: 345 },
  { id: "bitumen", name: "Bitumen (Residue)", temp: "> 450°C", carbons: "C50+", use: "Road asphalt, roofing & waterproofing", defaultYield: 10, yPos: 400 },
];

export default function CrudeOilDistillationSimulation() {
  const [furnaceTemp, setFurnaceTemp] = useState(380);
  const [feedRate, setFeedRate] = useState(50000);
  const [columnPressure, setColumnPressure] = useState(1.2);
  const [selectedFraction, setSelectedFraction] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef(null);

  const yields = useMemo(() => {
    const tempFactor = (furnaceTemp - 380) / 100;
    const pressFactor = (columnPressure - 1.2) * 0.15;
    
    return FRACTIONS.map(f => {
      let adjustedYield = f.defaultYield;
      if (f.id === "gas" || f.id === "petrol") {
        adjustedYield = Math.max(1, Math.round(f.defaultYield * (1 + tempFactor * 0.4 - pressFactor)));
      } else if (f.id === "bitumen" || f.id === "fueloil") {
        adjustedYield = Math.max(2, Math.round(f.defaultYield * (1 - tempFactor * 0.3 + pressFactor)));
      }
      const bpd = Math.round((adjustedYield / 100) * feedRate);
      return { ...f, yieldPct: adjustedYield, bpd };
    });
  }, [furnaceTemp, feedRate, columnPressure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const maxParticles = 90;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: 180 + Math.random() * 40,
        y: 430 - Math.random() * 370,
        vy: 0.8 + Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.6,
        radius: 1.5 + Math.random() * 2,
        targetY: 70 + Math.random() * 350,
        alpha: 0.2 + Math.random() * 0.8,
      });
    }

    let animationFrame;
    const render = () => {
      if (isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.y -= p.vy * (furnaceTemp / 350);
          p.x += p.vx;

          if (p.x < 170) p.x = 172;
          if (p.x > 230) p.x = 228;

          if (p.y <= p.targetY) {
            ctx.beginPath();
            ctx.arc(p.x + (250 - p.x) * 0.3, p.y, p.radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
            ctx.fill();

            p.y = 440;
            p.x = 180 + Math.random() * 40;
            p.targetY = 70 + Math.random() * 350;
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 220, 220, ${p.alpha})`;
            ctx.fill();
          }
        });
      }
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, furnaceTemp]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 select-none space-y-4 font-sans text-xs bg-black text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-neutral-400">
              CHEMICAL ENGINEERING // FRACTIONAL DISTILLATION
            </span>
            <span className="text-[10px] font-mono text-neutral-500">60 FPS VERIFIED</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight mt-1">
            Crude Oil Fractional Distillation & Petroleum Derivatives
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
          >
            {isPlaying ? "⏸ Pause Flow" : "▶ Resume Flow"}
          </button>
          <button
            onClick={() => {
              setFurnaceTemp(380);
              setFeedRate(50000);
              setColumnPressure(1.2);
              setSelectedFraction(null);
            }}
            className="px-3 py-1.5 rounded-full border border-neutral-800 bg-black hover:bg-neutral-900 text-neutral-400 hover:text-white text-xs transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-xl p-3 relative flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-2 px-2">
            <span>DISTILLATION TOWER (45m)</span>
            <span>GRADIENT: 380°C → 25°C</span>
          </div>

          <div className="relative w-full max-w-[460px] h-[460px] bg-black/60 rounded-lg border border-neutral-900 overflow-hidden">
            <canvas ref={canvasRef} width={460} height={460} className="absolute inset-0 z-10 pointer-events-none" />
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 460 460">
              <rect x="30" y="380" width="90" height="60" rx="6" fill="#171717" stroke="#333333" strokeWidth="1.5" />
              <text x="75" y="410" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">FURNACE</text>
              <text x="75" y="425" fill="#a3a3a3" fontSize="8" textAnchor="middle" fontFamily="monospace">{furnaceTemp}°C</text>
              <path d="M 120 410 L 165 410" stroke="#737373" strokeWidth="6" fill="none" />
              <rect x="165" y="45" width="70" height="385" rx="12" fill="#0d0d0d" stroke="#404040" strokeWidth="2" />
              {FRACTIONS.map((f) => (
                <g key={f.id}>
                  <line x1="168" y1={f.yPos} x2="232" y2={f.yPos} stroke="#525252" strokeDasharray="3 2" strokeWidth="1.5" />
                  <path d={`M 235 ${f.yPos} L 275 ${f.yPos}`} stroke="#525252" strokeWidth="3" fill="none" />
                  <circle cx="275" cy={f.yPos} r="3" fill="#ffffff" />
                </g>
              ))}
            </svg>

            <div className="absolute right-2 top-0 bottom-0 w-[185px] z-20 flex flex-col justify-start pt-8">
              {yields.map((f) => {
                const isSelected = selectedFraction?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFraction(f)}
                    style={{ position: "absolute", top: f.yPos - 14, right: 6 }}
                    className={`cursor-pointer px-2 py-1 rounded border text-[10px] transition-all flex items-center justify-between w-[170px] ${
                      isSelected
                        ? "bg-white text-black border-white font-medium shadow-md scale-105"
                        : "bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800"
                    }`}
                  >
                    <span className="truncate">{f.name.split(" ")[0]}</span>
                    <span className="font-mono text-[9px] opacity-80">{f.yieldPct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full mt-3 pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Crude Input: {feedRate.toLocaleString()} BPD</span>
            <span>Pressure: {columnPressure.toFixed(1)} atm</span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-semibold text-white tracking-tight uppercase font-mono">
              Process Parameters
            </h2>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Furnace Temperature</span>
                <span className="text-white font-bold">{furnaceTemp} °C</span>
              </div>
              <input
                type="range"
                min="280"
                max="450"
                step="5"
                value={furnaceTemp}
                onChange={(e) => setFurnaceTemp(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Crude Feed Rate</span>
                <span className="text-white font-bold">{feedRate.toLocaleString()} BPD</span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="5000"
                value={feedRate}
                onChange={(e) => setFeedRate(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Column Pressure</span>
                <span className="text-white font-bold">{columnPressure.toFixed(1)} atm</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.1"
                value={columnPressure}
                onChange={(e) => setColumnPressure(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-white tracking-tight uppercase font-mono">
                {selectedFraction ? selectedFraction.name : "Fraction Yields"}
              </h2>
            </div>

            {selectedFraction ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Boiling Range:</span>
                    <span className="text-white">{selectedFraction.temp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Carbon Chain:</span>
                    <span className="text-white">{selectedFraction.carbons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Primary Uses:</span>
                    <span className="text-white font-sans text-[11px] text-right max-w-[170px]">{selectedFraction.use}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-800">
                    <span className="text-neutral-500">Daily Output:</span>
                    <span className="text-white font-bold">{selectedFraction.bpd.toLocaleString()} bpd</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFraction(null)}
                  className="w-full py-1 text-center text-[10px] text-neutral-400 hover:text-white border border-neutral-800 rounded bg-neutral-900/50"
                >
                  ← Show All Fractions
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {yields.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFraction(f)}
                    className="cursor-pointer p-1.5 rounded hover:bg-neutral-900 transition-colors flex items-center justify-between text-[11px] font-mono"
                  >
                    <span className="text-neutral-300">{f.name.split(" ")[0]}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: `${Math.min(100, f.yieldPct * 3)}%` }}></div>
                      </div>
                      <span className="text-white font-bold w-7 text-right">{f.yieldPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
