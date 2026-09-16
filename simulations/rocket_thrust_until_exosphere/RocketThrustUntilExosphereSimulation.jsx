import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function RocketThrustUntilExosphereSimulation() {
  // State variables from specification
  const [throttle, setThrottle] = useState(0.8);
  const [specificImpulse, setSpecificImpulse] = useState(300);
  const [propellantMassInitial, setPropellantMassInitial] = useState(200000);
  const [dryMass, setDryMass] = useState(50000);
  const [nozzleExitArea, setNozzleExitArea] = useState(2.0);
  const [dragCoefficient, setDragCoefficient] = useState(0.5);
  const [crossSectionalArea, setCrossSectionalArea] = useState(10.0);
  const [altitude, setAltitude] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs for GSAP animation targets
  const rocketRef = useRef(null);
  const plumeRef = useRef(null);
  const particleContainerRef = useRef(null);
  const hudThrustRef = useRef(null);
  const hudAltitudeRef = useRef(null);
  const hudVelocityRef = useRef(null);
  const hudFuelRef = useRef(null);
  const hudDragRef = useRef(null);

  // Derived dynamics (memoized)
  const exhaustVelocity = useMemo(() => specificImpulse * 9.80665, [specificImpulse]);
  const massFlowRate = useMemo(() => throttle * (propellantMassInitial / 120), [throttle, propellantMassInitial]);
  const currentMass = useMemo(() => Math.max(dryMass, propellantMassInitial + dryMass - massFlowRate * timeElapsed), [propellantMassInitial, dryMass, massFlowRate, timeElapsed]);
  const thrustMomentum = useMemo(() => massFlowRate * exhaustVelocity, [massFlowRate, exhaustVelocity]);
  const ambientPressure = useMemo(() => 101325 * Math.exp(-altitude / 7400), [altitude]);
  const exhaustPressure = 20000; // constant
  const pressureThrust = useMemo(() => (exhaustPressure - ambientPressure) * nozzleExitArea, [ambientPressure, nozzleExitArea]);
  const totalThrust = useMemo(() => thrustMomentum + pressureThrust, [thrustMomentum, pressureThrust]);
  const g = useMemo(() => 9.80665 * Math.pow(6371000, 2) / Math.pow(6371000 + altitude, 2), [altitude]);
  const weight = useMemo(() => currentMass * g, [currentMass, g]);
  const atmosphericDensity = useMemo(() => 1.225 * Math.exp(-altitude / 8500), [altitude]);
  const dragForce = useMemo(() => 0.5 * atmosphericDensity * Math.pow(velocity, 2) * dragCoefficient * crossSectionalArea, [atmosphericDensity, velocity, dragCoefficient, crossSectionalArea]);
  const netForce = useMemo(() => totalThrust - weight - dragForce, [totalThrust, weight, dragForce]);
  const acceleration = useMemo(() => netForce / currentMass, [netForce, currentMass]);
  const fuelFractionRemaining = useMemo(() => Math.max(0, (propellantMassInitial - massFlowRate * timeElapsed) / propellantMassInitial), [propellantMassInitial, massFlowRate, timeElapsed]);

  // Precomputed SVG paths and gradients
  const rocketPath = useMemo(() => {
    // Falcon 9-like multi-stage rocket: body, interstage, nose cone, nozzle
    return "M 480 400 " // start at bottom center
      // Main fuel tank (cylinder)
      + "c -30 0 -50 20 -50 40 " // left curve up
      + "v 120 " // straight up
      + "c 0 20 20 40 50 40 " // right curve
      + "h 60 " // interstage width
      // Upper stage tank
      + "c -20 0 -30 15 -30 35 " // left curve
      + "v 60 " // straight up
      + "c 0 20 15 35 35 35 " // right curve
      // Nose cone (ogive)
      + "c 20 0 35 -15 35 -35 "
      + "v -60 "
      + "c 0 -20 -15 -35 -35 -35 "
      // Nozzle
      + "h -60 "
      + "c -20 0 -35 -15 -35 -35 "
      + "v -40 "
      + "c 0 -20 15 -35 35 -35 "
      + "h 60 "
      + "c 20 0 35 15 35 35 "
      + "v 40 "
      + "c 0 20 -15 35 -35 35 "
      + "z"; // close path
  }, []);

  const plumePath = useMemo(() => {
    const baseLength = 20 + totalThrust / 5000; // scale with thrust
    const tipX = 480;
    const tipY = 400 - baseLength;
    const leftCtrlX = 460;
    const leftCtrlY = 400 - baseLength * 0.3;
    const rightCtrlX = 500;
    const rightCtrlY = 400 - baseLength * 0.3;
    return `M ${tipX} ${tipY} C ${leftCtrlX} ${leftCtrlY}, ${rightCtrlX} ${rightCtrlY}, ${tipX} ${tipY + baseLength} Z`;
  }, [totalThrust]);

  // Particles array (pre-populated for frame-0)
  const [particles, setParticles] = useState(() => {
    const arr = [];
    for (let i = 0; i < 35; i++) {
      arr.push({
        id: i,
        x: 480 + (Math.random() - 0.5) * 20,
        y: 400 + Math.random() * 10,
        life: Math.random(),
        type: Math.random() > 0.7 ? "ambient" : "exhaust"
      });
    }
    return arr;
  });

  // GSAP context and ticker
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Rocket translation based on integrated acceleration (simplified)
      gsap.to({}, {
        duration: 0.016,
        onUpdate: () => {
          // Simple Euler integration for demo
          setVelocity(prev => prev + acceleration * 0.016);
          setAltitude(prev => Math.max(0, prev + velocity * 0.016));
          setTimeElapsed(prev => prev + 0.016);
        }
      });

      // Animate particles
      gsap.to(particles, {
        duration: 0.1,
        repeat: -1,
        onUpdate: () => {
          const newParticles = particles.map(p => {
            if (p.type === "exhaust") {
              return {
                ...p,
                y: p.y - exhaustVelocity * 0.016 * (Math.random() * 0.5 + 0.5),
                x: p.x + (Math.random() - 0.5) * 2,
                life: (p.life + 0.01) % 1
              };
            } else {
              // Ambient particles slowed by drag
              return {
                ...p,
                y: p.y - velocity * 0.016 * 0.1,
                x: p.x + (Math.random() - 0.5) * 0.5,
                life: (p.life + 0.005) % 1
              };
            }
          });
          setParticles(newParticles);
        }
      });

      // Scale plume based on thrust
      gsap.to(plumeRef.current, {
        scaleY: Math.max(0.5, totalThrust / 500000),
        duration: 0.3
      });

      // Update HUD values
      if (hudThrustRef.current) hudThrustRef.current.textContent = `${Math.round(totalThrust)} N`;
      if (hudAltitudeRef.current) hudAltitudeRef.current.textContent = `${Math.round(altitude)} m`;
      if (hudVelocityRef.current) hudVelocityRef.current.textContent = `${Math.round(velocity)} m/s`;
      if (hudFuelRef.current) hudFuelRef.current.textContent = `${Math.round(fuelFractionRemaining * 100)}%`;
      if (hudDragRef.current) hudDragRef.current.textContent = `${Math.round(dragForce)} N`;
    }, rocketRef);

    return () => ctx.revert();
  }, [acceleration, velocity, altitude, timeElapsed, exhaustVelocity, totalThrust, dragForce, fuelFractionRemaining, particles]);

  // Playback controls
  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetSimulation = () => {
    setThrottle(0.8);
    setSpecificImpulse(300);
    setPropellantMassInitial(200000);
    setDryMass(50000);
    setNozzleExitArea(2.0);
    setDragCoefficient(0.5);
    setCrossSectionalArea(10.0);
    setAltitude(0);
    setVelocity(0);
    setTimeElapsed(0);
    setIsPlaying(false);
  };

  // Status badge logic
  const getStatus = () => {
    if (altitude > 100000) return { text: "Exosphere", color: "#10b981" };
    if (altitude > 50000) return { text: "Thermosphere", color: "#f59e0b" };
    if (altitude > 30000) return { text: "Mesosphere", color: "#f97316" };
    if (altitude > 15000) return { text: "Stratosphere", color: "#ef4444" };
    return { text: "Troposphere", color: "#6366f1" };
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#0b0f19] to-[#1e293b] text-white p-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Rocket Thrust Dynamics Until Exosphere Boundary</h1>
        <p className="text-sm text-gray-400">Visualizing Newton's third law and atmospheric effects on propulsion</p>
        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-[${getStatus().color}]/20 text-[${getStatus().color}]`}>
          {getStatus().text}
        </div>
      </div>

      {/* Telemetry HUD Grid */}
      <div className="grid w-full gap-4 px-4 mt-6">
        {[{
          label: "Altitude",
          value: `${Math.round(altitude)} m`,
          ref: hudAltitudeRef
        }, {
          label: "Velocity",
          value: `${Math.round(velocity)} m/s`,
          ref: hudVelocityRef
        }, {
          label: "Thrust",
          value: `${Math.round(totalThrust)} N`,
          ref: hudThrustRef
        }, {
          label: "Acceleration",
          value: `${acceleration.toFixed(2)} m/s²`
        }, {
          label: "Fuel Remaining",
          value: `${Math.round(fuelFractionRemaining * 100)}%`,
          ref: hudFuelRef
        }, {
          label: "Drag Force",
          value: `${Math.round(dragForce)} N`,
          ref: hudDragRef
        }].map((metric, index) => (
          <div key={index} className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-300">{metric.label}</span>
              {metric.ref ? (
                <span className="text-lg font-mono text-[{getStatus().color}]" ref={metric.ref}>
                  {metric.value}
                </span>
              ) : (
                <span className="text-lg font-mono text-[{getStatus().color}]">{metric.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dedicated Simulation Stage */}
      <div className="w-full max-w-[960px] mx-auto mt-6">
        <svg
          viewBox="0 0 960 480"
          className="w-full h-[480px] bg-[#0f172a]/50 backdrop-blur-sm rounded-xl border border-[#334155]/30 overflow-hidden"
          ref={rocketRef}
        >
          {/* Defs for gradients and filters */}
          <defs>
            <linearGradient id="plumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffed4a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={5} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g className="stroke-[rgba(255,255,255,0.05)] stroke-1">
            {/* Altitude grid lines */}
            {[0, 20000, 40000, 60000, 80000, 100000, 120000].map(h => (
              <line key={h} x1="40" y1={400 - h / 300} x2="920" y2={400 - h / 300} />
            ))}
            {/* Vertical grid */}
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(v => (
              <line key={v} x1={v} y1="50" x2={v} y2="400" />
            ))}
          </g>

          {/* Atmospheric layer labels */}
          <g className="text-xs text-gray-400">
            <text x="20" y="380">Troposphere (0-15 km)</text>
            <text x="20" y="320">Stratosphere (15-50 km)</text>
            <text x="20" y="240">Mesosphere (50-85 km)</text>
            <text x="20" y="160">Thermosphere (85-600 km)</text>
            <text x="20" y="80">Exosphere (&gt;600 km)</text>
          </g>

          {/* Earth curvature hint */}
          <path d="M 0 420 Q 480 460 960 420" fill="none" stroke="#334155" strokeWidth="2" />

          {/* Layer 2: Primary Enclosure (Rocket Silhouette) */}
          <path d={rocketPath} fill="#2d3748" stroke="#e2e8f0" strokeWidth="1.5"
          >
            {/* White accents for details */}
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="0 0"
              dur="0.1s"
              repeatCount="indefinite"
            />
          </path>

          {/* Layer 3: Active Volumetric Medium (Exhaust Plume) */}
          <g ref={plumeRef}>
            <path d={plumePath} fill="url(#plumeGradient)" filter="url(#glow)"
            />
          </g>

          {/* Layer 4: Kinetic Actors and Particles */}
          <g ref={particleContainerRef}>
            {particles.map(p => (
              <circle key={p.id} cx={p.x} cy={p.y} r={p.type === "exhaust" ? 1.5 : 1} fill={p.type === "exhaust" ? "#f97316" : "#38bdf8"} opacity={p.type === "exhaust" ? 0.7 : 0.3}
              />
            ))}
          </g>

          {/* Layer 5: In-situ HUD Instrumentation */}
          <g className="text-xs text-[{getStatus().color}]">
            {/* Thrust vector arrow */}
            <line x1="480" y1="400" x2="480" y2={400 - Math.min(50, totalThrust / 10000)} stroke={getStatus().color} strokeWidth="2" markerEnd="url(#arrowhead)"
            />
            <text x="490" y={390 - Math.min(50, totalThrust / 10000)}>Thrust</text>

            {/* Altitude meter */}
            <rect x="520" y="350" width="120" height="20" fill="none" stroke="#334155" strokeWidth="1" />
            <rect x="520" y="350" width={Math.min(120, altitude / 1000)} height="20" fill={getStatus().color} fillOpacity="0.3" />
            <text x="580" y="365" textAnchor="middle">Altitude</text>

            {/* Velocity readout */}
            <circle cx="680" cy="360" r="15" fill="none" stroke="#334155" strokeWidth="1" />
            <text x="680" y="365" textAnchor="middle" dominantBaseline="middle">{Math.round(velocity / 100)}</text>
            <text x="680" y="380" textAnchor="middle" fontSize="xx-small">x100 m/s</text>

            {/* Fuel gauge */}
            <rect x="720" y="340" width="60" height="40" fill="none" stroke="#334155" strokeWidth="1" />
            <rect x="720" y="340" width={60 * fuelFractionRemaining} height="40" fill="#10b981" fillOpacity="0.5" />
            <text x="750" y="365" textAnchor="end">Fuel</text>

            {/* Drag vs Thrust */}
            <rect x="790" y="340" width="80" height="40" fill="none" stroke="#334155" strokeWidth="1" />
            <rect x="790" y="340" width={Math.min(80, dragForce / totalThrust * 80)} height="40" fill="#ef4444" fillOpacity="0.5" />
            <text x="830" y="365" textAnchor="end">Drag</text>
          </g>

          {/* Arrowhead marker def */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill={getStatus().color} />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Interactive Control Deck */}
      <div className="w-full max-w-[960px] mx-auto mt-6 grid gap-4 px-4">
        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Throttle Level</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={throttle}
              onChange={e => setThrottle(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{Math.round(throttle * 100)}%</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Specific Impulse (I_sp)</label>
          <div className="flex items-center">
            <input
              type="range"
              min="200"
              max="450"
              step="10"
              value={specificImpulse}
              onChange={e => setSpecificImpulse(parseInt(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{specificImpulse} s</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Initial Propellant Mass</label>
          <div className="flex items-center">
            <input
              type="range"
              min="50000"
              max="500000"
              step="10000"
              value={propellantMassInitial}
              onChange={e => setPropellantMassInitial(parseInt(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{propellantMassInitial.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Dry Mass</label>
          <div className="flex items-center">
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={dryMass}
              onChange={e => setDryMass(parseInt(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{dryMass.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Altitude</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="120000"
              step="1000"
              value={altitude}
              onChange={e => setAltitude(parseInt(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{altitude.toLocaleString()} m</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Velocity</label>
          <div className="flex items-center">
            <input
              type="range"
              min="-1000"
              max="10000"
              step="10"
              value={velocity}
              onChange={e => setVelocity(parseInt(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{velocity.toLocaleString()} m/s</span>
          </div>
        </div>

        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <label className="block text-sm font-medium mb-2">Time Elapsed</label>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="300"
              step="1"
              value={timeElapsed}
              onChange={e => setTimeElapsed(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-[#334155]/30 rounded"
            />
            <span className="ml-2 text-xs font-mono">{timeElapsed.toFixed(1)} s</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
          <div className="flex justify-center gap-4">
            <button
              onClick={togglePlay}
              className="px-4 py-2 bg-[{getStatus().color}]/20 hover:bg-[{getStatus().color}]/30 text-[{getStatus().color}] rounded-lg transition-colors"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={resetSimulation}
              className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Educational Theory Cards */}
      <div className="w-full max-w-[960px] mx-auto mt-6 grid gap-4 px-4">
        [{
          step: 1,
          title: "Ignition & Liftoff",
          text: "At sea level, high ambient pressure reduces effective thrust via pressure term. Thrust must exceed weight + drag for liftoff."
        }, {
          step: 2,
          title: "Ascent Through Atmosphere",
          text: "As altitude rises, ambient pressure drops, increasing thrust efficiency (better nozzle expansion). Drag peaks then decreases as air thins."
        }, {
          step: 3,
          title: "Approaching Exosphere Boundary",
          text: "Above ~100 km, drag becomes negligible. Thrust is now primarily momentum-driven. Rocket continues accelerating until fuel depletion or cutoff."
        }].map((card, index) =&gt; (
          <div key={index} className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl p-4 border border-[#334155]/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-[{getStatus().color}]/20 text-[{getStatus().color}] w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold">
                {card.step}
              </div>
              <div>
                <h3 className="font-medium text-base mb-1">{card.title}</h3>
                <p className="text-sm text-gray-300">{card.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
