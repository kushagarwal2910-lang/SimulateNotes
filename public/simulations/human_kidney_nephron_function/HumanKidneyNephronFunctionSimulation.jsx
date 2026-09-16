import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function HumanKidneyNephronFunctionSimulation() {
  // State variables for physiological parameters
  const [glomerularCapillaryPressure, setGlomerularCapillaryPressure] = useState(45);
  const [bowmansCapsulePressure, setBowmansCapsulePressure] = useState(15);
  const [glomerularPlasmaOncoticPressure, setGlomerularPlasmaOncoticPressure] = useState(25);
  const [filtrationCoefficient, setFiltrationCoefficient] = useState(12.5);
  const [plasmaGlucoseConcentration, setPlasmaGlucoseConcentration] = useState(5);
  const [tubularTransportMaximum, setTubularTransportMaximum] = useState(375);
  const [isPlaying, setIsPlaying] = useState(true);

  // Refs for SVG elements
  const afferentRef = useRef(null);
  const glomerulusRef = useRef(null);
  const efferentRef = useRef(null);
  const proximalTubuleRef = useRef(null);
  const collectingDuctRef = useRef(null);

  // Derived calculations (memoized)
  const netFiltrationPressure = useMemo(() => {
    return glomerularCapillaryPressure - bowmansCapsulePressure - glomerularPlasmaOncoticPressure;
  }, [glomerularCapillaryPressure, bowmansCapsulePressure, glomerularPlasmaOncoticPressure]);

  const glomerularFiltrationRate = useMemo(() => {
    return filtrationCoefficient * Math.max(0, netFiltrationPressure);
  }, [filtrationCoefficient, netFiltrationPressure]);

  const filteredGlucoseLoad = useMemo(() => {
    // Convert GFR (mL/min) * [Glucose] (mM) to mg/min: 1 mM glucose = 180 mg/dL = 1.8 mg/mL
    // So: GFR (mL/min) * [Glucose] (mM) * 1.8 = mg/min
    return glomerularFiltrationRate * plasmaGlucoseConcentration * 1.8;
  }, [glomerularFiltrationRate, plasmaGlucoseConcentration]);

  const glucoseReabsorptionRate = useMemo(() => {
    // Tm * (1 - e^(-k * [S])) with k=0.02 for glucose
    return Math.min(
      filteredGlucoseLoad,
      tubularTransportMaximum * (1 - Math.exp(-0.02 * plasmaGlucoseConcentration))
    );
  }, [filteredGlucoseLoad, tubularTransportMaximum, plasmaGlucoseConcentration]);

  const glucoseExcretionRate = useMemo(() => {
    return Math.max(0, filteredGlucoseLoad - glucoseReabsorptionRate);
  }, [filteredGlucoseLoad, glucoseReabsorptionRate]);

  const urineFlowRate = useMemo(() => {
    // Approximately 80% of filtered water becomes urine (simplified)
    return glomerularFiltrationRate * 0.8;
  }, [glomerularFiltrationRate]);

  const fractionalSodiumReabsorption = useMemo(() => {
    return 0.99 - (0.05 * Math.exp(-plasmaGlucoseConcentration / 10));
  }, [plasmaGlucoseConcentration]);

  // Pre-computed SVG paths for frame-0 declarative curves
  const afferentPath = useMemo(() => "M100,240 C120,200 180,200 200,240", []);
  const glomerulusCircle = useMemo(() => ({ cx: 250, cy: 240, r: 30 }), []);
  const efferentPath = useMemo(() => "M300,240 C320,280 380,280 400,240", []);
  const proximalTubulePath = useMemo(() => "M420,200 L440,220 L460,200 L480,220 L500,200 L520,220 L540,200", []);
  const collectingDuctPath = useMemo(() => "M560,200 L600,240 L640,200 L680,240", []);

  // GSAP context and ticker setup
  const gsapContext = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    gsapContext.current = gsap.context(() => {
      // Create a repeating timeline for continuous animations
      timelineRef.current = gsap.timeline({ repeat: -1 });

      // Afferent arteriole pulse (stroke dasharray)
      if (afferentRef.current) {
        timelineRef.current.to(afferentRef.current, {
          strokeDasharray: "10, 0",
          duration: 1.5,
          ease: "none"
        }, 0).to(afferentRef.current, {
          strokeDasharray: "0, 10",
          duration: 1.5,
          ease: "none"
        }, 1.5);
      }

      // Glomerulus pulsation (fill opacity)
      if (glomerulusRef.current) {
        timelineRef.current.to(glomerulusRef.current, {
          fillOpacity: 0.6,
          duration: 1,
          ease: "easeInOut"
        }, 0).to(glomerulusRef.current, {
          fillOpacity: 0.3,
          duration: 1,
          ease: "easeInOut"
        }, 1);
      }

      // Efferent arteriole flow (stroke width)
      if (efferentRef.current) {
        timelineRef.current.to(efferentRef.current, {
          strokeWidth: 1.5,
          duration: 1.5,
          ease: "easeInOut"
        }, 0).to(efferentRef.current, {
          strokeWidth: 3,
          duration: 1.5,
          ease: "easeInOut"
        }, 1.5);
      }

      // Proximal tubule flow (stroke dasharray)
      if (proximalTubuleRef.current) {
        timelineRef.current.to(proximalTubuleRef.current, {
          strokeDasharray: "5, 0",
          duration: 1,
          ease: "none"
        }, 0).to(proximalTubuleRef.current, {
          strokeDasharray: "0, 5",
          duration: 1,
          ease: "none"
        }, 1);
      }

      // Collecting duct flow (stroke dashoffset)
      if (collectingDuctRef.current) {
        timelineRef.current.to(collectingDuctRef.current, {
          strokeDashoffset: 20,
          duration: 1.5,
          ease: "none"
        }, 0).to(collectingDuctRef.current, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "none"
        }, 1.5);
      }
    }, document.getElementById("nephron-svg"));

    // GSAP ticker for play/pause control (registered ONCE)
    const tick = () => {
      if (isPlaying && timelineRef.current) {
        timelineRef.current.progress((timelineRef.current.progress() + 0.01) % 1);
      }
    };
    

    return () => {
      gsap.ticker.remove(tick);
      gsapContext.current?.revert();
    };
  }, [isPlaying]);

  // Reset to defaults
  const resetToDefaults = () => {
    setGlomerularCapillaryPressure(45);
    setBowmansCapsulePressure(15);
    setGlomerularPlasmaOncoticPressure(25);
    setFiltrationCoefficient(12.5);
    setPlasmaGlucoseConcentration(5);
    setTubularTransportMaximum(375);
    setIsPlaying(true);
  };

  // Telemetry metrics data
  const telemetryMetrics = [
    { label: "Net Filtration Pressure", value: netFiltrationPressure.toFixed(1), unit: "mmHg" },
    { label: "Glomerular Filtration Rate", value: glomerularFiltrationRate.toFixed(1), unit: "mL/min" },
    { label: "Filtered Glucose Load", value: filteredGlucoseLoad.toFixed(1), unit: "mg/min" },
    { label: "Glucose Reabsorption Rate", value: glucoseReabsorptionRate.toFixed(1), unit: "mg/min" },
    { label: "Glucose Excretion Rate", value: glucoseExcretionRate.toFixed(1), unit: "mg/min" },
    { label: "Urine Flow Rate", value: urineFlowRate.toFixed(1), unit: "mL/min" }
  ];

  // Educational callouts
  const educationalCards = [
    {
      step: 1,
      title: "Blood Entry & Filtration",
      text: "Blood enters the glomerulus via the afferent arteriole. High glomerular capillary pressure (~45 mmHg) drives plasma filtration through capillary walls into Bowman's capsule, forming primary filtrate."
    },
    {
      step: 2,
      title: "Selective Reabsorption in Tubules",
      text: "The filtrate flows into the proximal tubule where glucose, amino acids, sodium, and water are actively reabsorbed back into peritubular capillaries. Glucose reabsorption reaches maximum at high plasma concentrations (Tm effect)."
    },
    {
      step: 3,
      title: "Urine Formation & Excretion",
      text: "Remaining fluid and wastes (urea, creatinine, excess ions) continue to the collecting duct. Final urine composition reflects the balance between filtration, reabsorption, and secretion, flowing to the bladder for excretion."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] to-[#1a1f2e] text-white p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Human Kidney Nephron Filtration and Reabsorption</h1>
        <p className="text-lg opacity-90">Visualizing glomerular filtration and tubular reabsorption processes</p>
        <div className="mt-3 px-4 py-2 bg-[#1e293b]/50 rounded-xl backdrop-blur-sm">
          <span className="text-xs font-medium">{isPlaying ? "▶️ Playing" : "⏸️ Paused"}</span>
        </div>
      </div>

      {/* Telemetry HUD Grid */}
      <div className="grid gap-4 mb-6 text-center">
        {telemetryMetrics.map((metric, index) => (
          <div key={index} className="bg-[#1e293b]/50 rounded-xl p-4 backdrop-blur-sm border border-[#334155]/30">
            <div className="text-sm font-medium text-[#94a3b8] mb-1">{metric.label}</div>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-xs text-[#64748b]">{metric.unit}</div>
          </div>
        ))}
      </div>

      {/* Dedicated Simulation Stage */}
      <div className="aspect-w-16 aspect-h-9 bg-[#0f172a]/50 rounded-2xl p-4 border border-[#334155]/30 relative">
        <svg
          id="nephron-svg"
          viewBox="0 0 960 480"
          className="w-full h-full"
          style={{ minHeight: "400px" }}
        >
          <defs>
            <radialGradient id="bloodGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#ff0000" />
            </radialGradient>
            <linearGradient id="urineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a8e6cf" />
              <stop offset="100%" stopColor="#dcedc1" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#38bdf8" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Afferent Arteriole */}
          <path ref={afferentRef} d={afferentPath} stroke="url(#bloodGradient)" strokeWidth="4" fill="none" filter="url(#glow)"
          />

          {/* Glomerulus */}
          <circle ref={glomerulusRef} cx={glomerulusCircle.cx} cy={glomerulusCircle.cy} r={glomerulusCircle.r} fill="url(#bloodGradient)" fillOpacity={0.3} filter="url(#glow)"
          />

          {/* Efferent Arteriole */}
          <path ref={efferentRef} d={efferentPath} stroke="url(#bloodGradient)" strokeWidth="3" fill="none" filter="url(#glow)"
          />

          {/* Proximal Tubule */}
          <path ref={proximalTubuleRef} d={proximalTubulePath} stroke="#34d399" strokeWidth="3" fill="none" filter="url(#glow)"
          />

          {/* Collecting Duct */}
          <path ref={collectingDuctRef} d={collectingDuctPath} stroke="url(#urineGradient)" strokeWidth="3" fill="none" filter="url(#glow)"
          />

          {/* Labels */}
          <text x="150" y="220" textAnchor="middle" fontSize="14" fill="#94a3b8">Afferent Arteriole</text>
          <text x="250" y="200" textAnchor="middle" fontSize="14" fill="#94a3b8">Glomerulus</text>
          <text x="350" y="260" textAnchor="middle" fontSize="14" fill="#94a3b8">Efferent Arteriole</text>
          <text x="480" y="180" textAnchor="middle" fontSize="14" fill="#94a3b8">Proximal Tubule</text>
          <text x="620" y="220" textAnchor="middle" fontSize="14" fill="#94a3b8">Collecting Duct</text>
          <text x="500" y="300" textAnchor="middle" fontSize="12" fill="#64748b">Filtrate Flow →</text>
        </svg>
      </div>

      {/* Interactive Control Deck */}
      <div className="grid gap-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Glomerular Capillary Pressure</label>
            <div className="flex items-center">
              <input
                type="range"
                min="30"
                max="60"
                step="1"
                value={glomerularCapillaryPressure}
                onChange={(e) => setGlomerularCapillaryPressure(Number(e.target.value))}
                className="w-full h-2 bg-[#334155] rounded"
              />
              <span className="ml-2 text-xs min-w-[40px] text-right">{glomerularCapillaryPressure} mmHg</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bowman's Capsule Pressure</label>
            <div className="flex items-center">
              <input
                type="range"
                min="10"
                max="20"
                step="0.5"
                value={bowmansCapsulePressure}
                onChange={(e) => setBowmansCapsulePressure(Number(e.target.value))}
                className="w-full h-2 bg-[#334155] rounded"
              />
              <span className="ml-2 text-xs min-w-[40px] text-right">{bowmansCapsulePressure} mmHg</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Glomerular Plasma Oncotic Pressure</label>
            <div className="flex items-center">
              <input
                type="range"
                min="15"
                max="35"
                step="1"
                value={glomerularPlasmaOncoticPressure}
                onChange={(e) => setGlomerularPlasmaOncoticPressure(Number(e.target.value))}
                className="w-full h-2 bg-[#334155] rounded"
              />
              <span className="ml-2 text-xs min-w-[40px] text-right">{glomerularPlasmaOncoticPressure} mmHg</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filtration Coefficient (Kf)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="5"
                max="20"
                step="0.5"
                value={filtrationCoefficient}
                onChange={(e) => setFiltrationCoefficient(Number(e.target.value))}
                className="w-full h-2 bg-[#334155] rounded"
              />
              <span className="ml-2 text-xs min-w-[40px] text-right">{filtrationCoefficient} mL/min/mmHg</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plasma Glucose Concentration</label>
            <div className="flex items-center">
              <input
                type="range"
                min="3"
                max="20"
                step="0.5"
                value={plasmaGlucoseConcentration}
                onChange={(e) => setPlasmaGlucoseConcentration(Number(e.target.value))}
                className="w-full h-2 bg-[#334155] rounded"
              />
              <span className="ml-2 text-xs min-w-[40px] text-right">{plasmaGlucoseConcentration} mM</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tubular Transport Maximum (Tm)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="200"
                max="500"
                step="10"
                value={tubularTransportMaximum}
                onChange={(e) => setTubularTransportMaximum(Number(e.target.value))}
                className="w-full h-2 bg-[#334155] rounded"
              />
              <span className="ml-2 text-xs min-w-[40px] text-right">{tubularTransportMaximum} mg/min</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="col-span-full">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-6 py-2 bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 text-[#38bdf8] font-medium rounded-lg transition-colors border border-[#38bdf8]/30"
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
            <button
              onClick={resetToDefaults}
              className="px-6 py-2 bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 text-[#f43f5e] font-medium rounded-lg transition-colors border border-[#f43f5e]/30"
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Educational Theory Cards */}
      <div className="grid gap-4">
        {educationalCards.map((card) => (
          <div key={card.step} className="bg-[#1e293b]/50 rounded-xl p-4 backdrop-blur-sm border border-[#334155]/30">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center bg-[#38bdf8]/20 rounded-lg text-[#38bdf8] font-bold">
                {card.step}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-sm text-[#94a3b8] mt-1">{card.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
