import React, { useState, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function EarthGravityTunnelSimulation() {
  const [tunnelCondition, setTunnelCondition] = useState("vacuum_maglev");
  const [gravityModel, setGravityModel] = useState("prem_realistic");
  const [tunnelLatitude, setTunnelLatitude] = useState("equator");
  const [simulationSpeed, setSimulationSpeed] = useState(15);
  const [playbackState, setPlaybackState] = useState("paused");
  
  // Real-time kinematics & position state
  // currentPos: -6371 (North surface) to 0 (Earth center) to +6371 (South antipode)
  const [currentPosKm, setCurrentPosKm] = useState(-6371);
  const [currentVelocityMps, setCurrentVelocityMps] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [wallCollision, setWallCollision] = useState(false);
  const [stuckAtCore, setStuckAtCore] = useState(false);

  const containerRef = useRef(null);
  const capsuleRef = useRef(null);
  const velocityArrowRef = useRef(null);
  const gravityArrowRef = useRef(null);
  const coriolisArrowRef = useRef(null);
  const depthPointerRef = useRef(null);

  const R_EARTH = 6371.0;
  const SURFACE_GRAVITY = 9.80665;
  const EARTH_ROTATION_RAD_S = 7.292115e-5;
  const CORE_TEMPERATURE_C = 5700.0;
  const CORE_PRESSURE_GPA = 360.0;

  // Current depth measured from surface of entry (0 km to 12,742 km)
  const currentDepthKm = currentPosKm + R_EARTH;
  const radiusFromCenterKm = Math.abs(currentPosKm);

  // Local gravitational acceleration g(r) based on Newton's Shell Theorem
  const localGravityMps2 = useMemo(() => {
    if (radiusFromCenterKm >= R_EARTH) return SURFACE_GRAVITY;
    if (gravityModel === "uniform_density") {
      return SURFACE_GRAVITY * (radiusFromCenterKm / R_EARTH);
    }
    // Realistic PREM Model: Core is much denser (13 g/cm³), so g peaks at CMB (3480 km radius)
    if (radiusFromCenterKm > 3480) {
      return SURFACE_GRAVITY * (0.95 + 0.15 * ((R_EARTH - radiusFromCenterKm) / (R_EARTH - 3480)));
    }
    return 10.7 * (radiusFromCenterKm / 3480);
  }, [radiusFromCenterKm, gravityModel]);

  // Ambient thermodynamic and geological properties
  const localTemperatureC = useMemo(() => {
    if (radiusFromCenterKm > 3480) {
      return 20 + (CORE_TEMPERATURE_C - 20) * Math.pow((R_EARTH - radiusFromCenterKm) / (R_EARTH - 3480), 0.7);
    }
    return CORE_TEMPERATURE_C;
  }, [radiusFromCenterKm]);

  const localPressureGpa = useMemo(() => {
    return CORE_PRESSURE_GPA * (1.0 - Math.pow(radiusFromCenterKm / R_EARTH, 1.6));
  }, [radiusFromCenterKm]);

  // Coriolis lateral deflection acceleration
  const latitudeRad = tunnelLatitude === "equator" ? 0 : tunnelLatitude === "mid_latitude" ? Math.PI / 4 : Math.PI / 2;
  const coriolisFactor = tunnelLatitude === "equator" ? 1.0 : tunnelLatitude === "mid_latitude" ? 0.707 : 0.0;
  const coriolisAccelMps2 = 2 * EARTH_ROTATION_RAD_S * Math.abs(currentVelocityMps) * Math.cos(latitudeRad);

  // Geological Layer Identification
  const currentGeologicalLayer = useMemo(() => {
    if (radiusFromCenterKm > 6336) return "Continental / Oceanic Crust (0–35 km)";
    if (radiusFromCenterKm > 5701) return "Upper Mantle / Asthenosphere (35–670 km)";
    if (radiusFromCenterKm > 3480) return "Lower Mantle / Mesosphere (670–2,890 km)";
    if (radiusFromCenterKm > 1221) return "Molten Liquid Outer Core (2,890–5,150 km)";
    if (radiusFromCenterKm > 10) return "Solid Crystalline Inner Core (5,150–6,371 km)";
    return "Exact Planetary Center (r ≈ 0 km, Zero Gravity)";
  }, [radiusFromCenterKm]);

  // Contextual Dynamic Hazard Status
  const hazardStatus = useMemo(() => {
    if (wallCollision) {
      return { text: "💥 FATAL: Coriolis Wall Impact at Hypersonic Speed!", color: "#ef4444" };
    }
    if (stuckAtCore) {
      return { text: "⚠️ TRAPPED: Atmospheric Drag Depleted Energy (Floating at Core)", color: "#f59e0b" };
    }
    if (radiusFromCenterKm < 80) {
      return { text: "⚖️ Center Crossing: Max Velocity Mach 23 | Weightless (g ≈ 0)", color: "#34d399" };
    }
    if (localPressureGpa > 150) {
      return { text: `🔥 Crushing Core Regime: ${localPressureGpa.toFixed(0)} GPa | ${localTemperatureC.toFixed(0)}°C`, color: "#f97316" };
    }
    if (currentVelocityMps > 0 && currentPosKm > 0) {
      return { text: "Ascending to Antipode (Gravity Deceleration)", color: "#38bdf8" };
    }
    return { text: "Inward Acceleration Through Mantle", color: "#818cf8" };
  }, [wallCollision, stuckAtCore, radiusFromCenterKm, localPressureGpa, localTemperatureC, currentVelocityMps, currentPosKm]);

  // Formatted display helpers
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  // Main Physics Simulation Loop via GSAP Ticker
  useEffect(() => {
    let lastTime = performance.now();
    let posKm = currentPosKm;
    let velMps = currentVelocityMps;
    let timeSec = elapsedSeconds;
    let lateralDriftM = 0;

    const tick = (currentTime) => {
      if (playbackState !== "playing") {
        lastTime = currentTime;
        return;
      }

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      // Clamp dt to avoid physics instability on frame drops
      const dt = Math.min(0.1, rawDt) * simulationSpeed * 60;

      // 1. Calculate Gravitational Restoration Force
      // Gravity always pulls toward planetary center (r = 0)
      const r = Math.abs(posKm);
      let gVal = 0;
      if (gravityModel === "uniform_density") {
        gVal = SURFACE_GRAVITY * (r / R_EARTH);
      } else {
        gVal = r > 3480
          ? SURFACE_GRAVITY * (0.95 + 0.15 * ((R_EARTH - r) / (R_EARTH - 3480)))
          : 10.7 * (r / 3480);
      }
      // Force direction: if posKm < 0 (North), pull is positive (downward toward center)
      // if posKm > 0 (South), pull is negative (upward toward center)
      let accelMps2 = -Math.sign(posKm) * gVal;

      // 2. Air Drag / Aerodynamic Resistance
      if (tunnelCondition === "air_filled") {
        // Density increases exponentially toward core under hyperbaric air column
        const normalizedAirDensity = 1.225 * Math.exp(((R_EARTH - r) / R_EARTH) * 5.0);
        const dragForce = 0.5 * normalizedAirDensity * velMps * Math.abs(velMps) * 0.47 * 0.8;
        const capsuleMassKg = 800;
        accelMps2 -= dragForce / capsuleMassKg;
      }

      // 3. Coriolis Lateral Drift Check
      if (tunnelCondition === "coriolis_collision") {
        lateralDriftM += coriolisFactor * 2 * EARTH_ROTATION_RAD_S * Math.abs(velMps) * dt;
        // If tunnel borehole diameter is 5 meters, wall collision occurs at 2.5m
        if (lateralDriftM > 2.5 && Math.abs(velMps) > 50) {
          setWallCollision(true);
          setPlaybackState("paused");
          return;
        }
      }

      // 4. Numerical Integration (Euler-Cromer)
      velMps += accelMps2 * dt;
      posKm += (velMps * dt) / 1000.0;
      timeSec += dt;

      // Air resistance settling at core check
      if (tunnelCondition === "air_filled" && Math.abs(posKm) < 50 && Math.abs(velMps) < 5) {
        setStuckAtCore(true);
        posKm = 0;
        velMps = 0;
        setPlaybackState("paused");
      }

      // Antipode surface breakout check
      if (posKm >= R_EARTH) {
        posKm = R_EARTH;
        velMps = 0;
        setPlaybackState("paused");
      } else if (posKm <= -R_EARTH && timeSec > 10) {
        posKm = -R_EARTH;
        velMps = 0;
        setPlaybackState("paused");
      }

      setCurrentPosKm(posKm);
      setCurrentVelocityMps(velMps);
      setElapsedSeconds(timeSec);
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [playbackState, simulationSpeed, tunnelCondition, gravityModel, tunnelLatitude]);

  // Reset to departure surface
  const handleReset = () => {
    setPlaybackState("paused");
    setCurrentPosKm(-R_EARTH);
    setCurrentVelocityMps(0);
    setElapsedSeconds(0);
    setWallCollision(false);
    setStuckAtCore(false);
  };

  // Convert current position (-6371 to +6371) to SVG coordinates along tunnel shaft
  // Tunnel shaft extends vertically in SVG from y = 40 (North Pole) to y = 380 (South Pole)
  // Center is at y = 210, x = 470
  const shaftTopY = 40;
  const shaftCenterY = 210;
  const shaftBottomY = 380;
  const shaftX = 470;
  const currentSvgY = shaftCenterY + (currentPosKm / R_EARTH) * (shaftCenterY - shaftTopY);

  // Vector arrow visual lengths (scaled for visual clarity)
  const velocityArrowLength = Math.max(-60, Math.min(60, (currentVelocityMps / 7900) * 55));
  const gravityArrowLength = (localGravityMps2 / 10.7) * 35 * -Math.sign(currentPosKm);
  const coriolisArrowLength = (coriolisFactor * (Math.abs(currentVelocityMps) / 7900)) * 32;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1150px",
        margin: "0 auto",
        padding: "24px 16px",
        backgroundColor: "#070b14",
        color: "#e2e8f0",
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Header with Title and Dynamic Hazard Regime Badge */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#f8fafc",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Earth Gravity Tunnel: Physics &amp; Lethal Effects of Drilling Through the Core
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            Newton&apos;s Shell Theorem, Coriolis deflection, 6,000°C thermal inferno, and 3.6 million atm lithostatic pressure
          </p>
        </div>
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 600,
            background: "rgba(15, 23, 42, 0.8)",
            border: `1px solid ${hazardStatus.color}`,
            color: hazardStatus.color,
            boxShadow: `0 0 12px -2px ${hazardStatus.color}40`,
            transition: "all 0.2s ease",
          }}
        >
          {hazardStatus.text}
        </div>
      </header>

      {/* 2. Real-Time Telemetry HUD Grid (Non-Overlapping) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginBottom: "4px" }}>
            Current Depth
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#38bdf8" }}>
            {currentDepthKm.toFixed(0)} km
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            Center at 6,371 km
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginBottom: "4px" }}>
            Velocity (Speed)
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#a855f7" }}>
            {(Math.abs(currentVelocityMps) * 3.6).toFixed(0)} km/h
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            Mach {(Math.abs(currentVelocityMps) / 343).toFixed(1)} (max 28,440 km/h)
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginBottom: "4px" }}>
            Local Gravity g(r)
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#60a5fa" }}>
            {localGravityMps2.toFixed(2)} m/s²
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            {radiusFromCenterKm < 50 ? "Zero Gravity (Weightless)" : `Shell Theorem (r = ${radiusFromCenterKm.toFixed(0)} km)`}
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginBottom: "4px" }}>
            Ambient Temperature
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: localTemperatureC > 1500 ? "#f97316" : "#facc15",
            }}
          >
            {localTemperatureC.toFixed(0)}°C
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            Core reaches ~5,700°C (Sun's surface)
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginBottom: "4px" }}>
            Lithostatic Pressure
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#ef4444" }}>
            {localPressureGpa.toFixed(1)} GPa
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            {(localPressureGpa * 9869.23 / 1000000).toFixed(2)}M atmospheres
          </div>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "14px",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginBottom: "4px" }}>
            Transit Timer
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#34d399" }}>
            {formatTime(elapsedSeconds)}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
            One-way: 38.2m (PREM) / 42.2m (Uniform)
          </div>
        </div>
      </div>

      {/* 3. Dedicated SVG Animation Stage (Planetary Cross-Section & Tunnel) */}
      <div
        style={{
          background: "#050811",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "16px",
          padding: "12px",
          boxShadow: "0 12px 36px -8px rgba(0, 0, 0, 0.7)",
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <svg
          ref={containerRef}
          viewBox="0 0 940 420"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            maxHeight: "440px",
          }}
        >
          <defs>
            {/* Atmospheric Outer Glow */}
            <filter id="planetGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Geological Gradients */}
            <radialGradient id="crustGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#44403c" />
              <stop offset="90%" stopColor="#292524" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>

            <radialGradient id="upperMantleGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>

            <radialGradient id="lowerMantleGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </radialGradient>

            <radialGradient id="outerCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>

            <radialGradient id="innerCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#facc15" />
            </radialGradient>

            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#e2e8f0" />
            </marker>
          </defs>

          {/* Planetary Cutaway Hemisphere & Concentric Geological Layers */}
          {/* Planet Center: (470, 210), Outer Radius = 170 px */}
          <circle cx="470" cy="210" r="172" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.4" filter="url(#planetGlow)" />
          
          {/* 1. Crust Layer (Outer Rim) */}
          <circle cx="470" cy="210" r="170" fill="url(#crustGrad)" stroke="#78716c" strokeWidth="1.5" />
          {/* 2. Upper Mantle / Asthenosphere */}
          <circle cx="470" cy="210" r="152" fill="url(#upperMantleGrad)" stroke="#ea580c" strokeWidth="1" />
          {/* 3. Lower Mantle / Mesosphere */}
          <circle cx="470" cy="210" r="120" fill="url(#lowerMantleGrad)" stroke="#b91c1c" strokeWidth="1" />
          {/* 4. Liquid Iron Outer Core (Convective Geodynamo) */}
          <circle cx="470" cy="210" r="75" fill="url(#outerCoreGrad)" stroke="#ca8a04" strokeWidth="1.5" />
          {/* 5. Solid Crystalline Inner Core */}
          <circle cx="470" cy="210" r="32" fill="url(#innerCoreGrad)" stroke="#fef08a" strokeWidth="2" />

          {/* Core Center Crosshair Marker */}
          <line x1="460" y1="210" x2="480" y2="210" stroke="#000" strokeWidth="1" opacity="0.6" />
          <line x1="470" y1="200" x2="470" y2="220" stroke="#000" strokeWidth="1" opacity="0.6" />

          {/* Geological Layer Annotations on Left */}
          <g opacity="0.85" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            <line x1="280" y1="55" x2="400" y2="55" stroke="#78716c" strokeDasharray="2,2" />
            <text x="275" y="58" textAnchor="end">Crust (0–35 km)</text>

            <line x1="260" y1="90" x2="380" y2="90" stroke="#ea580c" strokeDasharray="2,2" />
            <text x="255" y="93" textAnchor="end">Upper Mantle (35–670 km)</text>

            <line x1="240" y1="130" x2="370" y2="130" stroke="#b91c1c" strokeDasharray="2,2" />
            <text x="235" y="133" textAnchor="end">Lower Mantle (670–2,890 km)</text>

            <line x1="250" y1="175" x2="405" y2="175" stroke="#ca8a04" strokeDasharray="2,2" />
            <text x="245" y="178" textAnchor="end">Outer Core (2,890–5,150 km)</text>

            <line x1="270" y1="210" x2="440" y2="210" stroke="#facc15" strokeDasharray="2,2" />
            <text x="265" y="213" textAnchor="end" fill="#fef08a" fontWeight="600">Inner Core (r = 0, 5,700°C)</text>
          </g>

          {/* Vertical Borehole Shaft Through Earth's Axis */}
          <rect x="466" y="38" width="8" height="344" fill="#030712" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" rx="3" />
          
          {/* Depth Scale Tick Marks on Right */}
          <g fontSize="9" fill="#64748b">
            {[
              { d: 0, label: "North Pole (0 km)" },
              { d: 2890, label: "CMB (2,890 km)" },
              { d: 6371, label: "Center (6,371 km)" },
              { d: 9852, label: "CMB South (9,852 km)" },
              { d: 12742, label: "South Pole (12,742 km)" }
            ].map((tick, idx) => {
              const y = shaftTopY + (tick.d / (2 * R_EARTH)) * (shaftBottomY - shaftTopY);
              return (
                <g key={idx}>
                  <line x1="476" y1={y} x2="488" y2={y} stroke="#475569" strokeWidth="1" />
                  <text x="494" y={y + 3}>{tick.label}</text>
                </g>
              );
            })}
          </g>

          {/* Animated Transit Capsule / Pod */}
          <g ref={capsuleRef}>
            {/* Outer Glow Halo */}
            <circle cx={shaftX} cy={currentSvgY} r="9" fill="rgba(52, 211, 153, 0.25)" />
            {/* Main Capsule Body */}
            <circle
              cx={shaftX}
              cy={currentSvgY}
              r="6"
              fill={wallCollision ? "#ef4444" : "#34d399"}
              stroke="#ffffff"
              strokeWidth="1.5"
            />

            {/* Velocity Vector Arrow (Purple) */}
            {Math.abs(velocityArrowLength) > 4 && (
              <line
                ref={velocityArrowRef}
                x1={shaftX - 8}
                y1={currentSvgY}
                x2={shaftX - 8}
                y2={currentSvgY + velocityArrowLength}
                stroke="#a855f7"
                strokeWidth="2.5"
                markerEnd="url(#arrowhead)"
              />
            )}

            {/* Gravity Vector Arrow (Blue, points to center) */}
            {Math.abs(gravityArrowLength) > 3 && (
              <line
                ref={gravityArrowRef}
                x1={shaftX + 8}
                y1={currentSvgY}
                x2={shaftX + 8}
                y2={currentSvgY + gravityArrowLength}
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="3,2"
                markerEnd="url(#arrowhead)"
              />
            )}

            {/* Coriolis Lateral Force Arrow (Red, points Eastward) */}
            {tunnelCondition !== "vacuum_maglev" && coriolisArrowLength > 3 && (
              <line
                ref={coriolisArrowRef}
                x1={shaftX}
                y1={currentSvgY}
                x2={shaftX + coriolisArrowLength}
                y2={currentSvgY}
                stroke="#f43f5e"
                strokeWidth="2.5"
                markerEnd="url(#arrowhead)"
              />
            )}
          </g>

          {/* Legend Overlay at Top Right of Canvas */}
          <g transform="translate(730, 25)" fontSize="11" fill="#cbd5e1">
            <rect x="0" y="0" width="190" height="95" fill="rgba(15, 23, 42, 0.85)" rx="8" stroke="rgba(148, 163, 184, 0.2)" />
            <text x="12" y="20" fontWeight="600" fill="#f8fafc" fontSize="12">Dynamic Force Vectors</text>
            <circle cx="20" cy="40" r="4" fill="#a855f7" />
            <text x="32" y="44">Velocity Vector (v)</text>
            <circle cx="20" cy="60" r="4" fill="#60a5fa" />
            <text x="32" y="64">Gravity Pull g(r) → Center</text>
            <circle cx="20" cy="80" r="4" fill="#f43f5e" />
            <text x="32" y="84">Coriolis Deflection (East)</text>
          </g>
        </svg>
      </div>

      {/* 4. Interactive Control Deck (Clean Responsive Grid Below Canvas) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          width: "100%",
        }}
      >
        {/* Atmosphere & Guidance Mode Selector */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
            backdropFilter: "blur(8px)",
          }}
        >
          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>
            Tunnel Atmosphere &amp; Levitation
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { label: "Vacuum + MagLev (Harmonic Transit)", value: "vacuum_maglev" },
              { label: "Air-Filled (Drag Traps You at Core)", value: "air_filled" },
              { label: "Equatorial (Fatal Coriolis Smash)", value: "coriolis_collision" }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTunnelCondition(opt.value);
                  handleReset();
                }}
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  textAlign: "left",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: tunnelCondition === opt.value ? "1px solid #38bdf8" : "1px solid rgba(148, 163, 184, 0.2)",
                  background: tunnelCondition === opt.value ? "rgba(56, 189, 248, 0.2)" : "rgba(30, 41, 59, 0.4)",
                  color: tunnelCondition === opt.value ? "#ffffff" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Earth Density Model Selector */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
            backdropFilter: "blur(8px)",
          }}
        >
          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>
            Earth Density Profile
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { label: "Realistic PREM (Dense Core, 38m transit)", value: "prem_realistic" },
              { label: "Uniform Density (Hooke's Law, 42m transit)", value: "uniform_density" }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGravityModel(opt.value)}
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  textAlign: "left",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: gravityModel === opt.value ? "1px solid #6366f1" : "1px solid rgba(148, 163, 184, 0.2)",
                  background: gravityModel === opt.value ? "rgba(99, 102, 241, 0.2)" : "rgba(30, 41, 59, 0.4)",
                  color: gravityModel === opt.value ? "#ffffff" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drill Latitude Axis Selector */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
            backdropFilter: "blur(8px)",
          }}
        >
          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>
            Drill Axis &amp; Latitude
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { label: "North-South Poles (0 m/s Coriolis)", value: "poles" },
              { label: "Mid-Latitude 45° (329 m/s Coriolis)", value: "mid_latitude" },
              { label: "Equator 0° (Max 465 m/s Coriolis)", value: "equator" }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTunnelLatitude(opt.value)}
                style={{
                  padding: "8px 10px",
                  fontSize: "12px",
                  textAlign: "left",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: tunnelLatitude === opt.value ? "1px solid #f59e0b" : "1px solid rgba(148, 163, 184, 0.2)",
                  background: tunnelLatitude === opt.value ? "rgba(245, 158, 11, 0.2)" : "rgba(30, 41, 59, 0.4)",
                  color: tunnelLatitude === opt.value ? "#ffffff" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Playback Controls & Time Warp */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>
              Simulation Playback
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                onClick={() => setPlaybackState(playbackState === "playing" ? "paused" : "playing")}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: playbackState === "playing" ? "#e11d48" : "#22c55e",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {playbackState === "playing" ? "Pause" : "Drop Capsule"}
              </button>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Time Compression</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#38bdf8" }}>{simulationSpeed}x Speed</span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#38bdf8" }}
            />
          </div>
        </div>
      </div>

      {/* 5. Educational Theory Callout Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "14px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", margin: "0 0 6px 0" }}>
            Newton&apos;s Shell Theorem &amp; 38–42 Minute Transit
          </h3>
          <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#94a3b8", margin: 0 }}>
            As you fall inside Earth, the outer spherical shell of mass exerts zero net gravity. In an idealized uniform planet, gravity decreases linearly: g(r) ∝ r. This is Hooke&apos;s Law (F = -kr), producing Simple Harmonic Motion with a 42.2-minute transit. With Earth&apos;s dense iron core (PREM model), gravity remains near 10 m/s² through the mantle, accelerating transit to 38.2 minutes!
          </p>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", margin: "0 0 6px 0" }}>
            Killer #1: Coriolis Deflection (The Eastward Smash)
          </h3>
          <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#94a3b8", margin: 0 }}>
            Earth rotates eastward at 465 m/s at the equator. When you drop, you conserve that eastward momentum. But closer to the center, the surrounding rock has lower tangential velocity. By Coriolis acceleration a_c = -2(Ω × v), you slam into the eastern rock wall at hundreds of km/h unless drilled along the rotational axis (Poles) or guided by MagLev.
          </p>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", margin: "0 0 6px 0" }}>
            Killers #2 &amp; #3: 3.6 Million Atmospheres &amp; 6,000°C Heat
          </h3>
          <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#94a3b8", margin: 0 }}>
            Past 10–15 km depth, rock stops being brittle and flows like viscous putty. At the core, lithostatic pressure reaches 360 GPa (3.6 million atmospheres) and temperatures reach 5,700°C–6,000°C (hotter than the Sun&apos;s surface). Any physical borehole without active magnetic containment fields would instantly be crushed and flooded with liquid iron magma.
          </p>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", margin: "0 0 6px 0" }}>
            Killer #4: Air Column Drag &amp; Core Stagnation
          </h3>
          <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#94a3b8", margin: 0 }}>
            If the tunnel is open to air, the 6,371 km air column creates hyperbaric compression so extreme that air at the core becomes denser than liquid water. Aerodynamic drag causes terminal velocity to collapse, completely bleeding away your mechanical energy. Instead of traversing Earth, you oscillate a few times and end up permanently trapped floating weightless in the center.
          </p>
        </div>
      </div>
    </div>
  );
}
