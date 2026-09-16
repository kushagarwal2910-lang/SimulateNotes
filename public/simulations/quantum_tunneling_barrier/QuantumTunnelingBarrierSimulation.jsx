import React, { useState, useMemo, useEffect, useRef } from "react";

export default function QuantumTunnelingBarrierSimulation() {
  // --------------------------------------------------------------------------
  // 1. Interactive State
  // --------------------------------------------------------------------------
  const [particleEnergy, setParticleEnergy] = useState(4.5); // eV
  const [barrierHeight, setBarrierHeight] = useState(6.5); // eV
  const [barrierWidth, setBarrierWidth] = useState(1.2); // nm
  const [particleType, setParticleType] = useState("electron");
  const [displayMode, setDisplayMode] = useState("wave_and_particles");
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [phase, setPhase] = useState(0);

  // --------------------------------------------------------------------------
  // 2. Physics & Quantum Calculations (Exact Analytical Solutions)
  // --------------------------------------------------------------------------
  const massRatio = useMemo(() => {
    switch (particleType) {
      case "proton": return 1836.0;
      case "muon": return 207.0;
      default: return 1.0; // electron
    }
  }, [particleType]);

  const energyDeficit = Math.max(0, barrierHeight - particleEnergy);
  const isClassicallyForbidden = particleEnergy < barrierHeight;

  // Wavevector k in Region I & III (proportional to sqrt(m * E))
  const k = useMemo(() => {
    return Math.sqrt(2 * massRatio * Math.max(0.1, particleEnergy)) * 0.08;
  }, [massRatio, particleEnergy]);

  // Decay constant kappa in Region II (proportional to sqrt(m * (V0 - E)))
  const kappa = useMemo(() => {
    if (barrierHeight <= particleEnergy) return 0.01;
    return Math.sqrt(2 * massRatio * (barrierHeight - particleEnergy)) * 0.12;
  }, [massRatio, barrierHeight, particleEnergy]);

  // Exact transmission coefficient T
  const transmissionProbability = useMemo(() => {
    if (particleEnergy >= barrierHeight) {
      // Over-barrier transmission
      const k2 = Math.sqrt(2 * massRatio * Math.max(0.01, particleEnergy - barrierHeight)) * 0.08;
      const sinArg = k2 * barrierWidth * 10;
      const denom = 1 + (Math.pow(barrierHeight, 2) * Math.pow(Math.sin(sinArg), 2)) /
        (4 * particleEnergy * Math.max(0.05, particleEnergy - barrierHeight));
      return Math.min(1.0, 1.0 / Math.max(1.0, denom));
    } else {
      // Quantum tunneling regime (sinh argument)
      const sinhArg = Math.min(18, kappa * barrierWidth * 8);
      const sinhVal = Math.sinh(sinhArg);
      const denom = 1 + (Math.pow(barrierHeight, 2) * Math.pow(sinhVal, 2)) /
        (4 * particleEnergy * Math.max(0.05, barrierHeight - particleEnergy));
      return Math.min(1.0, 1.0 / Math.max(1.0, denom));
    }
  }, [particleEnergy, barrierHeight, barrierWidth, kappa, massRatio]);

  const reflectionProbability = Math.max(0, 1.0 - transmissionProbability);
  const transmittedAmplitude = Math.sqrt(transmissionProbability);
  const reflectedAmplitude = Math.sqrt(reflectionProbability);
  const penetrationDepth = kappa > 0.001 ? 1.0 / kappa : 10.0;

  const tunnelingRegimeLabel = useMemo(() => {
    if (particleEnergy >= barrierHeight) return "Over-Barrier Resonance (Classical Pass Allowed)";
    if (transmissionProbability < 0.0001) return "Extreme Attenuation (R ≈ 100%, Tunneling Near Zero)";
    if (transmissionProbability < 0.05) return "Deep Evanescent Tunneling (STM Microscope Regime)";
    return "High-Probability Quantum Tunneling";
  }, [particleEnergy, barrierHeight, transmissionProbability]);

  // --------------------------------------------------------------------------
  // 3. Animation Phase & Particle Stream (Declarative + RAF)
  // --------------------------------------------------------------------------
  const [particles, setParticles] = useState(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 60 + i * 50,
      y: 290,
      vx: 1.8 + (i % 3) * 0.2,
      phaseOffset: (i * Math.PI) / 4,
      state: "incident", // "incident" | "transmitted" | "reflected"
      opacity: 0.9,
    }));
  });

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Advance global wave phase
      setPhase((prev) => (prev + dt * 6 * simSpeed) % (Math.PI * 200));

      // Advance particle stream
      const barrierStartX = 380;
      const barrierEndX = 380 + barrierWidth * 80;

      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          let nx = p.x + p.vx * simSpeed * 60 * dt;
          let nState = p.state;
          let nvx = p.vx;

          if (nState === "incident" && nx >= barrierStartX) {
            // Decision at barrier entrance: transmit or reflect
            if (Math.random() < transmissionProbability) {
              nState = "transmitted";
              nx = barrierEndX + 2;
              nvx = Math.abs(p.vx);
            } else {
              nState = "reflected";
              nx = barrierStartX - 2;
              nvx = -Math.abs(p.vx);
            }
          }

          // Boundary reset
          if (nx > 880 || nx < 50) {
            return {
              ...p,
              x: 55 + Math.random() * 30,
              vx: Math.abs(p.vx),
              state: "incident",
            };
          }

          return { ...p, x: nx, vx: nvx, state: nState };
        })
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeed, barrierWidth, transmissionProbability]);

  // --------------------------------------------------------------------------
  // 4. Declarative SVG Paths (Frame-0 Ready, Zero Placeholders)
  // --------------------------------------------------------------------------
  const stageGeometry = useMemo(() => {
    const baseY = 300;
    const barrierStartX = 380;
    const barrierPixelWidth = Math.max(20, barrierWidth * 80);
    const barrierEndX = barrierStartX + barrierPixelWidth;
    const barrierPixelHeight = barrierHeight * 18;
    const barrierTopY = baseY - barrierPixelHeight;
    const energyLineY = baseY - particleEnergy * 18;

    // Build Continuous Wavefunction Curve psi(x)
    let wavePoints = [];
    let probPoints = [];
    const stepX = 3;

    for (let x = 60; x <= 870; x += stepX) {
      let psi = 0;

      if (x < barrierStartX) {
        // Region I: Incident wave + Reflected wave interference standing pattern
        const inc = Math.cos(k * (x - 60) - phase);
        const ref = reflectedAmplitude * Math.cos(-k * (x - barrierStartX) - phase + 1.2);
        psi = inc + ref;
      } else if (x <= barrierEndX) {
        // Region II: Evanescent exponential decay inside potential barrier
        const distInside = x - barrierStartX;
        const decayFactor = Math.exp(-kappa * (distInside / 25));
        const barrierOsc = Math.cos(phase * 0.4);
        psi = (1.0 + reflectedAmplitude) * 0.5 * decayFactor * barrierOsc;
      } else {
        // Region III: Transmitted traveling wave with amplitude sqrt(T)
        const distPast = x - barrierEndX;
        psi = transmittedAmplitude * Math.cos(k * distPast - phase + 0.5);
      }

      // Scale psi to pixels (amplitude ~ 28px)
      const waveY = baseY - psi * 28;
      wavePoints.push([x, waveY]);

      // Probability density |psi|^2
      const probY = baseY - Math.min(120, Math.pow(psi, 2) * 22);
      probPoints.push([x, probY]);
    }

    // Convert wavepoints to SVG path string
    const wavePathD = wavePoints.reduce(
      (acc, [x, y], idx) => (idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`),
      ""
    );

    // Convert probpoints to filled SVG polygon path string
    let probAreaD = `M ${probPoints[0][0].toFixed(1)} ${baseY}`;
    probPoints.forEach(([x, y]) => {
      probAreaD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    probAreaD += ` L ${probPoints[probPoints.length - 1][0].toFixed(1)} ${baseY} Z`;

    // Potential Barrier Profile
    const barrierProfileD = `M 60 ${baseY} L ${barrierStartX} ${baseY} L ${barrierStartX} ${barrierTopY} L ${barrierEndX} ${barrierTopY} L ${barrierEndX} ${baseY} L 870 ${baseY}`;

    return {
      baseY,
      barrierStartX,
      barrierEndX,
      barrierPixelWidth,
      barrierTopY,
      energyLineY,
      wavePathD,
      probAreaD,
      barrierProfileD,
    };
  }, [particleEnergy, barrierHeight, barrierWidth, k, kappa, reflectedAmplitude, transmittedAmplitude, phase]);

  // --------------------------------------------------------------------------
  // 5. Telemetry & Educational Metrics
  // --------------------------------------------------------------------------
  const telemetryMetrics = [
    {
      id: "transmission",
      label: "Tunneling Probability (T)",
      value: (transmissionProbability * 100).toFixed(2),
      unit: "%",
      color: "text-emerald-400",
      description: "Fraction of incident particle probability successfully crossing the barrier",
    },
    {
      id: "reflection",
      label: "Reflection Probability (R)",
      value: (reflectionProbability * 100).toFixed(2),
      unit: "%",
      color: "text-rose-400",
      description: "Fraction bounced backward due to quantum impedance mismatch",
    },
    {
      id: "decay_constant",
      label: "Evanescent Decay Rate (κ)",
      value: kappa.toFixed(2),
      unit: "nm⁻¹",
      color: "text-amber-400",
      description: "Spatial exponential decay gradient within the forbidden barrier zone",
    },
    {
      id: "penetration_depth",
      label: "Penetration Depth (δ = 1/κ)",
      value: penetrationDepth.toFixed(3),
      unit: "nm",
      color: "text-sky-400",
      description: "Characteristic distance at which wave amplitude drops to 1/e (~36.8%)",
    },
    {
      id: "energy_deficit",
      label: "Barrier Deficit (V₀ - E)",
      value: energyDeficit.toFixed(2),
      unit: "eV",
      color: "text-violet-400",
      description: "Classical energy shortfall required to leap the potential barrier",
    },
  ];

  const educationalCards = [
    {
      title: "1. Why Does Quantum Tunneling Occur?",
      content:
        "In classical physics, a particle with energy E < V₀ hitting a potential wall is 100% reflected, like a tennis ball bouncing off a stone wall. In quantum mechanics, particles possess wave-particle duality governed by Schrödinger's equation. Because the wave function ψ(x) and its derivative must remain smooth and continuous across boundaries, the wave does not stop abruptly at x = 380nm; instead, it decays exponentially inside (Region II). If the barrier is thin enough, a non-zero amplitude emerges on the right side, giving the particle a real physical probability of materializing beyond the wall.",
    },
    {
      title: "2. Exponential Thickness Sensitivity (The STM Principle)",
      content:
        "Observe what happens when you slide Barrier Width (L) from 0.6nm to 1.8nm: transmission T collapses exponentially! Because T ∝ exp(-2κL), a microscopic change in barrier thickness produces a massive change in tunneling current. This extreme sensitivity is the exact operating principle behind Scanning Tunneling Microscopes (STMs) and modern 3D NAND flash memory cells.",
    },
    {
      title: "3. Mass Dependence: Why Don't Humans Tunnel Through Walls?",
      content:
        "Switch the particle type from Electron to Proton. Notice how transmission collapses to virtually 0%! The decay constant κ scales with the square root of particle mass (√(m)). Because protons are ~1836 times heavier than electrons, their evanescent wave dies out almost immediately. For macroscopic objects like humans (10²⁸ times heavier), the tunneling probability is so incomprehensibly tiny that you would have to wait trillions of times the age of the universe to see an event.",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-sky-500/10 border border-sky-500/30 text-sky-400">
          Quantum Mechanics & Wave-Particle Duality
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
          Quantum Tunneling: Wavepacket Penetration Through a Potential Barrier
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-3xl mx-auto">
          Interactive simulation of a quantum wavepacket penetrating a classically impenetrable potential energy barrier (E &lt; V₀), illustrating exponential evanescent decay and boundary matching.
        </p>
        <div className="pt-1">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 shadow-sm">
            Current Regime: {tunnelingRegimeLabel}
          </span>
        </div>
      </div>

      {/* Telemetry HUD Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {telemetryMetrics.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-sm flex flex-col justify-between"
          >
            <div className="text-xs font-medium text-slate-400">{m.label}</div>
            <div className="my-1 text-2xl font-black tracking-tight">
              <span className={m.color}>{m.value}</span>{" "}
              <span className="text-xs font-normal text-slate-400">{m.unit}</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">{m.description}</div>
          </div>
        ))}
      </div>

      {/* Simulation Stage */}
      <div className="relative w-full rounded-2xl bg-[#0b0f19] border border-slate-800 overflow-hidden shadow-2xl">
        <svg
          viewBox="0 0 920 420"
          className="w-full h-auto block select-none"
          style={{ minHeight: "420px" }}
        >
          <defs>
            {/* Barrier Gradient */}
            <linearGradient id="barrierFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.15" />
            </linearGradient>

            {/* Probability Density Fill Gradient */}
            <linearGradient id="probFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>

            {/* Subtle Glow Filter */}
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Coordinate Grid Lines */}
          <g opacity="0.15" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4">
            <line x1="60" y1="120" x2="870" y2="120" />
            <line x1="60" y1="180" x2="870" y2="180" />
            <line x1="60" y1="240" x2="870" y2="240" />
            <line x1="220" y1="50" x2="220" y2="340" />
            <line x1="580" y1="50" x2="580" y2="340" />
            <line x1="740" y1="50" x2="740" y2="340" />
          </g>

          {/* Region Boundaries & Labels */}
          <g opacity="0.4" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3">
            <line x1={stageGeometry.barrierStartX} y1="40" x2={stageGeometry.barrierStartX} y2="340" />
            <line x1={stageGeometry.barrierEndX} y1="40" x2={stageGeometry.barrierEndX} y2="340" />
          </g>
          <g fontSize="11" fill="#94a3b8" fontWeight="600" textAnchor="middle">
            <text x="220" y="55">REGION I: Superposition (ψ_inc + ψ_ref)</text>
            <text x={(stageGeometry.barrierStartX + stageGeometry.barrierEndX) / 2} y="35" fill="#c084fc">
              REGION II: Evanescent Barrier
            </text>
            <text x={(stageGeometry.barrierEndX + 870) / 2} y="55" fill="#34d399">
              REGION III: Transmitted Wave
            </text>
          </g>

          {/* Potential Barrier V(x) Block */}
          <rect x={stageGeometry.barrierStartX} y={stageGeometry.barrierTopY} width={stageGeometry.barrierPixelWidth} height={stageGeometry.baseY - stageGeometry.barrierTopY} fill="url(#barrierFillGrad)" stroke="#818cf8" strokeWidth="2" rx="4"
          />
          {/* Barrier Outline Path */}
          <path d={stageGeometry.barrierProfileD} fill="none" stroke="#6366f1" strokeWidth="2.5" opacity="0.8" />

          {/* Barrier Height V0 Label */}
          <g textAnchor="end" fontSize="12" fill="#c084fc" fontWeight="bold">
            <text x={stageGeometry.barrierStartX - 8} y={stageGeometry.barrierTopY + 14}>
              V₀ = {barrierHeight.toFixed(1)} eV
            </text>
          </g>

          {/* Particle Energy Line E */}
          <line x1="60" y1={stageGeometry.energyLineY} x2="870" y2={stageGeometry.energyLineY} stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,4" opacity="0.9"
          />
          <text x="70" y={stageGeometry.energyLineY - 8} fontSize="12" fill="#38bdf8" fontWeight="bold">
            Energy E = {particleEnergy.toFixed(1)} eV
          </text>

          {/* Energy Deficit Bracket Annotation */}
          {isClassicallyForbidden && (
            <g opacity="0.7">
              <line x1={stageGeometry.barrierStartX + 8} y1={stageGeometry.barrierTopY} x2={stageGeometry.barrierStartX + 8} y2={stageGeometry.energyLineY} stroke="#f43f5e" strokeWidth="2"
              />
              <text
                x={stageGeometry.barrierStartX + 14}
                y={(stageGeometry.barrierTopY + stageGeometry.energyLineY) / 2 + 4}
                fontSize="10"
                fill="#f43f5e"
                fontWeight="bold"
              >
                ΔE = {energyDeficit.toFixed(1)} eV
              </text>
            </g>
          )}

          {/* Baseline (V = 0) */}
          <line x1="60" y1={stageGeometry.baseY} x2="870" y2={stageGeometry.baseY} stroke="#475569" strokeWidth="2" />
          <text x="65" y={stageGeometry.baseY + 18} fontSize="11" fill="#64748b">
            Baseline V = 0 eV
          </text>

          {/* Probability Density Shaded Area */}
          {(displayMode === "probability_density" || displayMode === "wave_and_particles") && (
            <path d={stageGeometry.probAreaD} fill="url(#probFillGrad)" opacity="0.85" />
          )}

          {/* Wavefunction Curve psi(x) */}
          {(displayMode === "wave_and_particles" || displayMode === "complex_components") && (
            <path d={stageGeometry.wavePathD} fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#waveGlow)"
            />
          )}

          {/* Animated Quantum Wavepacket Particles */}
          {(displayMode === "wave_and_particles") &&
            particles.map((p) => {
              const isReflected = p.state === "reflected";
              const isTransmitted = p.state === "transmitted";
              const pColor = isTransmitted ? "#34d399" : isReflected ? "#f43f5e" : "#38bdf8";

              return (
                <g key={p.id} opacity={p.opacity}>
                  {/* Wavepacket Envelope Halo */}
                  <circle cx={p.x} cy={p.y} r="7" fill={pColor} opacity="0.25" />
                  {/* Particle Core */}
                  <circle cx={p.x} cy={p.y} r="3.5" fill={pColor} filter="url(#waveGlow)" />
                </g>
              );
            })}

          {/* Classical vs Quantum Comparison HUD inside Stage */}
          <g transform="translate(70, 365)">
            <rect width="780" height="38" rx="8" fill="#0f172a" stroke="#1e293b" />
            <text x="20" y="24" fontSize="11" fill="#94a3b8">
              <tspan fill="#f43f5e" fontWeight="bold">Classical Mechanics:</tspan> Particles strictly 100% blocked (T = 0.00%)
            </text>
            <text x="420" y="24" fontSize="11" fill="#94a3b8">
              <tspan fill="#34d399" fontWeight="bold">Quantum Mechanics:</tspan> Tunneling Transmission = {(transmissionProbability * 100).toFixed(2)}%
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Control Deck */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition shadow ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              }`}
            >
              {isPlaying ? "⏸ Pause Wave" : "▶ Play Wave"}
            </button>
            <button
              onClick={() => {
                setParticleEnergy(4.5);
                setBarrierHeight(6.5);
                setBarrierWidth(1.2);
                setParticleType("electron");
                setPhase(0);
              }}
              className="px-4 py-2 rounded-lg font-semibold text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
            >
              ↺ Reset Defaults
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Simulation Speed:</span>
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  simSpeed === spd
                    ? "bg-sky-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Particle Energy Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-sky-300">Particle Energy (E)</label>
              <span className="font-mono text-sky-400 font-bold">{particleEnergy.toFixed(1)} eV</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              value={particleEnergy}
              onChange={(e) => setParticleEnergy(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1.0 eV (Low kinetic energy)</span>
              <span>10.0 eV (High)</span>
            </div>
          </div>

          {/* Barrier Height Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-indigo-300">Barrier Potential (V₀)</label>
              <span className="font-mono text-indigo-400 font-bold">{barrierHeight.toFixed(1)} eV</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="12.0"
              step="0.1"
              value={barrierHeight}
              onChange={(e) => setBarrierHeight(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>3.0 eV (Low barrier)</span>
              <span>12.0 eV (Impenetrable wall)</span>
            </div>
          </div>

          {/* Barrier Thickness Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-amber-300">Barrier Thickness (L)</label>
              <span className="font-mono text-amber-400 font-bold">{barrierWidth.toFixed(1)} nm</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={barrierWidth}
              onChange={(e) => setBarrierWidth(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0.4 nm (Atomic monolayer)</span>
              <span>2.5 nm (Macroscopic limit)</span>
            </div>
          </div>
        </div>

        {/* Multi-Choice Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/80">
          {/* Particle Mass Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Particle Mass Category (Scales κ ∝ √m)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "electron", label: "Electron", sub: "m = 1.0 m_e" },
                { id: "muon", label: "Muon", sub: "m = 207 m_e" },
                { id: "proton", label: "Proton", sub: "m = 1836 m_e" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setParticleType(p.id)}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    particleType === p.id
                      ? "bg-indigo-600/30 border-indigo-500 text-white shadow"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="text-xs font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-500">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visualization Display Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Visual Representation Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "wave_and_particles", label: "Wave + Packets", sub: "Superposition & Flow" },
                { id: "probability_density", label: "Density |ψ|²", sub: "Probability Distribution" },
                { id: "complex_components", label: "Wave Only", sub: "Pure Continuous Wave" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setDisplayMode(m.id)}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    displayMode === m.id
                      ? "bg-sky-600/30 border-sky-500 text-white shadow"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] text-slate-500">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Theory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {educationalCards.map((c, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-start space-y-2"
          >
            <h2 className="font-bold text-sm text-sky-400">{c.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
