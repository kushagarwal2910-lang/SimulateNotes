import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { gsap } from "gsap";

export default function BernoulliSimulation() {
  /* ---------- State ---------- */
  const [d1, setD1] = useState(0.1); // m
  const [d2Ratio, setD2Ratio] = useState(0.5); // ratio
  const [v1, setV1] = useState(2.5); // m/s
  const [p1Kpa, setP1Kpa] = useState(150); // kPa (display)
  const [rhoLabel, setRhoLabel] = useState("Water (1000 kg/m³)");
  const [showVectors, setShowVectors] = useState(true);
  const [showEnergy, setShowEnergy] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const rhoMap = {
    "Water (1000 kg/m³)": 1000,
    "Oil (850 kg/m³)": 850,
    "Air (1.2 kg/m³)": 1.2,
  };
  const rho = useMemo(() => rhoMap[rhoLabel], [rhoLabel]);
  const p1 = p1Kpa * 1000; // Pa

  /* ---------- Refs ---------- */
  const containerRef = useRef(null);
  const manometerRefs = useRef(Array(3).fill(null));
  const arrowRefs = useRef(Array(3).fill(null));
  const arrowHeadRefs = useRef(Array(3).fill(null));
  const energyBarRefs = useRef({ inlet: { static: null, kinetic: null }, throat: { static: null, kinetic: null } });
  const particleRefs = useRef([]);

  /* ---------- Derived Values ---------- */
  const derived = useMemo(() => {
    const d2 = d1 * d2Ratio;
    const A1 = Math.PI * Math.pow(d1 / 2, 2);
    const A2 = Math.PI * Math.pow(d2 / 2, 2);
    const v2 = v1 * (A1 / A2);
    const dynP1 = 0.5 * rho * Math.pow(v1, 2);
    const dynP2 = 0.5 * rho * Math.pow(v2, 2);
    const p2 = Math.max(1000, p1 + dynP1 - dynP2);
    const deltaP = p1 - p2;
    const g = 9.81;
    const scale = 0.0006;
    const h1 = Math.min(180, Math.max(20, (p1 / (rho * g)) * scale * 100));
    const h2 = Math.min(180, Math.max(20, (p2 / (rho * g)) * scale * 100));
    const h3 = h1;
    return {
      d2,
      A1,
      A2,
      v2,
      dynP1,
      dynP2,
      p2,
      deltaP,
      h1,
      h2,
      h3,
    };
  }, [d1, d2Ratio, v1, p1, rho]);

  /* ---------- Playback Control ---------- */
  const tickRef = useRef(null);
  useEffect(() => {
    tickRef.current = () => {
      const dt = 1 / 60;
      particleRefs.current.forEach((p) => {
        p.x += p.speed * dt * 120;
        if (p.x > 860) p.x = 40;
        if (p.node) p.node.setAttribute("cx", p.x);
      });
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const onTick = () => {
        if (tickRef.current && isPlaying) {
          tickRef.current();
        }
      };
      gsap.ticker.add(onTick);
      return () => gsap.ticker.remove(onTick);
    }, containerRef.current);
    return () => ctx.revert();
  }, [isPlaying]);

  /* ---------- Initialize Particles ---------- */
  useEffect(() => {
    if (!containerRef.current) return;
    const streamlineCount = 5;
    const particlesPerLine = 16;
    const yBase = 220;
    const yOffsets = [-16, -8, 0, 8, 16];
    const particles = [];
    for (let s = 0; s < streamlineCount; s++) {
      const y = yBase + yOffsets[s];
      for (let i = 0; i < particlesPerLine; i++) {
        const progress = i / particlesPerLine;
        const x = 50 + progress * 800;
        let speed = v1;
        if (x < 250) speed = v1;
        else if (x < 380) speed = v1 + (derived.v2 - v1) * ((x - 250) / 130);
        else if (x < 520) speed = derived.v2;
        else if (x < 650) speed = derived.v2 + (v1 - derived.v2) * ((x - 520) / 130);
        else speed = v1;
        particles.push({ x, y, speed, progress });
      }
    }
    const svg = containerRef.current.querySelector("#particle-layer");
    if (svg) {
      svg.innerHTML = "";
      particles.forEach((p, idx) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p.x);
        circle.setAttribute("cy", p.y);
        circle.setAttribute("r", 3.5);
        const threshold = (v1 + derived.v2) / 2;
        circle.setAttribute("fill", p.speed < threshold ? "#60a5fa" : "#f59e0b");
        circle.setAttribute("opacity", "0.9");
        svg.appendChild(circle);
        particleRefs.current[idx] = { ...p, node: circle };
      });
    }
  }, [d1, d2Ratio, v1, rho, p1, derived.v2]);

  /* ---------- Update Visuals on Param Change ---------- */
  const updateVisuals = useCallback(() => {
    if (!containerRef.current) return;
    manometerRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const height = [derived.h1, derived.h2, derived.h3][i];
      gsap.to(ref, {
        attr: { y: 220 - height, height: height },
        duration: 0.5,
        ease: "power2.out",
      });
    });

    if (showVectors) {
      const lenFactor = 8;
      const lengths = [v1, derived.v2, v1];
      arrowRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const xBase = 160 + i * 290;
        gsap.to(ref, {
          attr: { x2: xBase + lengths[i] * lenFactor },
          duration: 0.5,
          ease: "power2.out",
        });
        const head = arrowHeadRefs.current[i];
        if (head) {
          const endX = xBase + lengths[i] * lenFactor;
          gsap.to(head, {
            attr: {
              points: `${endX + 6},220 ${endX},216 ${endX},224`,
            },
            duration: 0.5,
            ease: "power2.out",
          });
        }
      });
    }

    if (showEnergy) {
      const barTotalHeight = 90;
      const totalInlet = derived.p1 + derived.dynP1 || 1;
      const staticInlet = Math.max(5, (derived.p1 / totalInlet) * barTotalHeight);
      const kineticInlet = Math.max(5, (derived.dynP1 / totalInlet) * barTotalHeight);

      if (energyBarRefs.current.inlet.static) {
        gsap.to(energyBarRefs.current.inlet.static, {
          attr: { y: 150 - staticInlet, height: staticInlet },
          duration: 0.5,
          ease: "power2.out",
        });
      }
      if (energyBarRefs.current.inlet.kinetic) {
        gsap.to(energyBarRefs.current.inlet.kinetic, {
          attr: { y: 150 - staticInlet - kineticInlet, height: kineticInlet },
          duration: 0.5,
          ease: "power2.out",
        });
      }

      const totalThroat = derived.p2 + derived.dynP2 || 1;
      const staticThroat = Math.max(5, (derived.p2 / totalThroat) * barTotalHeight);
      const kineticThroat = Math.max(5, (derived.dynP2 / totalThroat) * barTotalHeight);

      if (energyBarRefs.current.throat.static) {
        gsap.to(energyBarRefs.current.throat.static, {
          attr: { y: 150 - staticThroat, height: staticThroat },
          duration: 0.5,
          ease: "power2.out",
        });
      }
      if (energyBarRefs.current.throat.kinetic) {
        gsap.to(energyBarRefs.current.throat.kinetic, {
          attr: { y: 150 - staticThroat - kineticThroat, height: kineticThroat },
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }
  }, [derived, showVectors, showEnergy, v1]);

  useEffect(() => {
    updateVisuals();
  }, [updateVisuals]);

  /* ---------- Handlers ---------- */
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setD1(0.1);
    setD2Ratio(0.5);
    setV1(2.5);
    setP1Kpa(150);
    setRhoLabel("Water (1000 kg/m³)");
    setShowVectors(true);
    setShowEnergy(true);
    setIsPlaying(true);
  };
  const handleToggleVectors = () => setShowVectors(!showVectors);
  const handleToggleEnergy = () => setShowEnergy(!showEnergy);

  /* ---------- Telemetry ---------- */
  const telemetry = [
    { label: "Inlet Speed (v₁)", value: `${v1.toFixed(2)} m/s`, color: "#60a5fa" },
    { label: "Throat Speed (v₂)", value: `${derived.v2.toFixed(2)} m/s`, color: "#f59e0b" },
    { label: "Speed Multiplier", value: `${(derived.v2 / v1).toFixed(2)}× faster`, color: "#a855f7" },
    { label: "Inlet Pressure (P₁)", value: `${(p1 / 1000).toFixed(0)} kPa`, color: "#ef4444" },
    { label: "Throat Pressure (P₂)", value: `${(derived.p2 / 1000).toFixed(0)} kPa`, color: "#06b6d4" },
    { label: "Pressure Drop (ΔP)", value: `${(derived.deltaP / 1000).toFixed(0)} kPa`, color: "#10b981" },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        background: "linear-gradient(180deg, #0b0f19 0%, #060911 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#e2e8f0",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: "#60a5fa", letterSpacing: "-0.02em" }}>
            Bernoulli's Principle & Venturi Flow Simulation
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#94a3b8" }}>
            Visualizing conservation of mechanical energy and continuity in fluid dynamics
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#93c5fd", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
            React 18 + GSAP
          </span>
          <span style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#6ee7b7", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
            {isPlaying ? "● Running 60 FPS" : "❚❚ Paused"}
          </span>
        </div>
      </div>

      {/* Main Content: Canvas on Left, Controls on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        {/* Simulation Canvas Card */}
        <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", overflow: "hidden" }}>
          <svg
            viewBox="0 0 900 360"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <defs>
              <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="glowThroat" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Venturi Pipe Geometry */}
            <g>
              {/* Inlet Section 1 */}
              <rect x="50" y="170" width="200" height="100" fill="url(#pipeGrad)" stroke="#3b82f6" strokeWidth="2" />
              {/* Converging Section */}
              <polygon points={`250,170 380,${220 - (d2Ratio * 50)} 380,${220 + (d2Ratio * 50)} 250,270`} fill="url(#pipeGrad)" stroke="#3b82f6" strokeWidth="2" />
              {/* Throat Section 2 */}
              <rect x="380" y={220 - (d2Ratio * 50)} width="140" height={d2Ratio * 100} fill="url(#glowThroat)" stroke="#f59e0b" strokeWidth="2" />
              {/* Diverging Section */}
              <polygon points={`520,${220 - (d2Ratio * 50)} 650,170 650,270 520,${220 + (d2Ratio * 50)}`} fill="url(#pipeGrad)" stroke="#3b82f6" strokeWidth="2" />
              {/* Outlet Section 3 */}
              <rect x="650" y="170" width="200" height="100" fill="url(#pipeGrad)" stroke="#3b82f6" strokeWidth="2" />
            </g>

            {/* Manometer Tubes */}
            <g>
              {[160, 450, 740].map((x, i) => (
                <g key={i}>
                  <rect x={x - 10} y={40} width="20" height="130" fill="rgba(255,255,255,0.03)" stroke="#64748b" strokeWidth="1.5" rx="3" />
                  <line x1={x - 14} y1={40} x2={x + 14} y2={40} stroke="#64748b" strokeWidth="1" />
                  <line x1={x - 14} y1={80} x2={x + 14} y2={80} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1={x - 14} y1={120} x2={x + 14} y2={120} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                </g>
              ))}
              {/* Dynamic Liquid Columns */}
              {[0, 1, 2].map((i) => (
                <rect
                  key={i}
                  ref={(el) => (manometerRefs.current[i] = el)}
                  x={160 + i * 290 - 8}
                  y={170}
                  width="16"
                  height="0"
                  fill={i === 0 ? "#ef4444" : i === 1 ? "#06b6d4" : "#10b981"}
                  rx="2"
                />
              ))}
              <text x="160" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f87171">P₁ (Inlet)</text>
              <text x="450" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22d3ee">P₂ (Throat)</text>
              <text x="740" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#34d399">P₃ (Outlet)</text>
            </g>

            {/* Streamlines Guide */}
            <g opacity="0.15">
              {[-16, -8, 0, 8, 16].map((offset, idx) => (
                <path
                  key={idx}
                  d={`M 50 ${220 + offset} L 250 ${220 + offset} L 380 ${220 + offset * d2Ratio} L 520 ${220 + offset * d2Ratio} L 650 ${220 + offset} L 850 ${220 + offset}`}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}
            </g>

            {/* Dynamic Particle Flow Layer */}
            <g id="particle-layer" />

            {/* Velocity Vectors */}
            {showVectors && (
              <g>
                {[0, 1, 2].map((i) => {
                  const xBase = 160 + i * 290;
                  return (
                    <g key={i}>
                      <line
                        ref={(el) => (arrowRefs.current[i] = el)}
                        x1={xBase}
                        y1={220}
                        x2={xBase + 30}
                        y2={220}
                        stroke={i === 1 ? "#f59e0b" : "#60a5fa"}
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <polygon
                        ref={(el) => (arrowHeadRefs.current[i] = el)}
                        points={`${xBase + 36},220 ${xBase + 30},216 ${xBase + 30},224`}
                        fill={i === 1 ? "#f59e0b" : "#60a5fa"}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Energy Conservation Live Stacked Bars */}
            {showEnergy && (
              <g opacity="0.85">
                {/* Inlet Energy Bar */}
                <g>
                  <rect x="70" y="55" width="22" height="95" fill="rgba(255,255,255,0.02)" stroke="#3b82f6" strokeWidth="1" rx="2" />
                  <rect ref={(el) => (energyBarRefs.current.inlet.static = el)} x="71" y="100" width="20" height="40" fill="#ef4444" rx="1" />
                  <rect ref={(el) => (energyBarRefs.current.inlet.kinetic = el)} x="71" y="60" width="20" height="40" fill="#f59e0b" rx="1" />
                  <text x="81" y="48" textAnchor="middle" fontSize="10" fill="#94a3b8">Energy 1</text>
                </g>
                {/* Throat Energy Bar */}
                <g>
                  <rect x="490" y="55" width="22" height="95" fill="rgba(255,255,255,0.02)" stroke="#3b82f6" strokeWidth="1" rx="2" />
                  <rect ref={(el) => (energyBarRefs.current.throat.static = el)} x="491" y="120" width="20" height="20" fill="#ef4444" rx="1" />
                  <rect ref={(el) => (energyBarRefs.current.throat.kinetic = el)} x="491" y="60" width="20" height="60" fill="#f59e0b" rx="1" />
                  <text x="501" y="48" textAnchor="middle" fontSize="10" fill="#94a3b8">Energy 2</text>
                </g>
              </g>
            )}

            {/* Legend & Labels */}
            <g transform="translate(60, 310)">
              <circle cx="10" cy="10" r="5" fill="#60a5fa" />
              <text x="22" y="14" fontSize="12" fill="#cbd5e1">Slow Fluid (v₁)</text>
              <circle cx="150" cy="10" r="5" fill="#f59e0b" />
              <text x="162" y="14" fontSize="12" fill="#cbd5e1">Accelerated Fluid (v₂)</text>
              <rect x="300" y="5" width="12" height="10" fill="#ef4444" rx="2" />
              <text x="320" y="14" fontSize="12" fill="#cbd5e1">Static Pressure (P)</text>
              <rect x="460" y="5" width="12" height="10" fill="#f59e0b" rx="2" />
              <text x="480" y="14" fontSize="12" fill="#cbd5e1">Kinetic Energy (½ρv²)</text>
            </g>
          </svg>
        </div>

        {/* Controls HUD Panel */}
        <div style={{ background: "rgba(15, 23, 42, 0.7)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#60a5fa", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px" }}>
            Simulation Controls
          </h2>

          {/* Slider 1: Inlet Velocity */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "#cbd5e1" }}>Inlet Velocity (v₁):</span>
              <span style={{ fontWeight: 600, color: "#60a5fa" }}>{v1.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.2"
              value={v1}
              onChange={(e) => setV1(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#3b82f6", cursor: "pointer" }}
            />
          </div>

          {/* Slider 2: Constriction Ratio */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "#cbd5e1" }}>Throat Constriction (d₂/d₁):</span>
              <span style={{ fontWeight: 600, color: "#f59e0b" }}>{d2Ratio.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.35"
              max="0.85"
              step="0.05"
              value={d2Ratio}
              onChange={(e) => setD2Ratio(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }}
            />
          </div>

          {/* Slider 3: Inlet Pressure */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "#cbd5e1" }}>Inlet Pressure (P₁):</span>
              <span style={{ fontWeight: 600, color: "#ef4444" }}>{p1Kpa} kPa</span>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              step="5"
              value={p1Kpa}
              onChange={(e) => setP1Kpa(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#ef4444", cursor: "pointer" }}
            />
          </div>

          {/* Fluid Selector */}
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "#cbd5e1", marginBottom: "6px" }}>
              Working Fluid:
            </label>
            <select
              value={rhoLabel}
              onChange={(e) => setRhoLabel(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {Object.keys(rhoMap).map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={handlePlayPause}
              style={{
                padding: "8px",
                background: isPlaying ? "rgba(16, 185, 129, 0.2)" : "rgba(100, 116, 139, 0.2)",
                border: isPlaying ? "1px solid #10b981" : "1px solid #64748b",
                borderRadius: "6px",
                color: isPlaying ? "#6ee7b7" : "#cbd5e1",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isPlaying ? "❚❚ Pause" : "▶ Play"}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "8px",
                background: "rgba(99, 102, 241, 0.2)",
                border: "1px solid #6366f1",
                borderRadius: "6px",
                color: "#a5b4fc",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ↺ Reset
            </button>
            <button
              onClick={handleToggleVectors}
              style={{
                padding: "8px",
                background: showVectors ? "rgba(59, 130, 246, 0.2)" : "rgba(100, 116, 139, 0.1)",
                border: showVectors ? "1px solid #3b82f6" : "1px solid #475569",
                borderRadius: "6px",
                color: showVectors ? "#93c5fd" : "#94a3b8",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {showVectors ? "Hide Vectors" : "Show Vectors"}
            </button>
            <button
              onClick={handleToggleEnergy}
              style={{
                padding: "8px",
                background: showEnergy ? "rgba(168, 85, 247, 0.2)" : "rgba(100, 116, 139, 0.1)",
                border: showEnergy ? "1px solid #a855f7" : "1px solid #475569",
                borderRadius: "6px",
                color: showEnergy ? "#d8b4fe" : "#94a3b8",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {showEnergy ? "Hide Energy" : "Show Energy"}
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry & Education Section */}
      <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Telemetry Cards */}
        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Real-Time Telemetry HUD
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {telemetry.map((t) => (
              <div
                key={t.label}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  padding: "12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{t.label}</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: t.color }}>{t.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedagogical Callouts */}
        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Key Physical Concepts
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", borderLeft: "3px solid #3b82f6", borderRadius: "4px", padding: "10px 14px", fontSize: "13px", lineHeight: "1.4" }}>
              <strong style={{ color: "#60a5fa" }}>1. Continuity (A₁v₁ = A₂v₂):</strong> Because fluid is incompressible, mass entering must equal mass exiting. As area shrinks, velocity must increase!
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", borderLeft: "3px solid #f59e0b", borderRadius: "4px", padding: "10px 14px", fontSize: "13px", lineHeight: "1.4" }}>
              <strong style={{ color: "#fbbf24" }}>2. Bernoulli Energy Conservation:</strong> The surge in kinetic energy (½ρv²) in the throat borrows energy from internal static pressure (P), causing pressure to drop.
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", borderLeft: "3px solid #06b6d4", borderRadius: "4px", padding: "10px 14px", fontSize: "13px", lineHeight: "1.4" }}>
              <strong style={{ color: "#22d3ee" }}>3. Manometer Verification:</strong> Notice the center liquid tube column drops lower than the inlet! This physically proves lower pressure in the faster stream.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
