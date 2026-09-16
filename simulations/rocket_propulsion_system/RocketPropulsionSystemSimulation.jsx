import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function RocketPropulsionSystemSimulation() {
  const [propellantFlowRate, setPropellantFlowRate] = useState(250.0);
  const [exhaustVelocity, setExhaustVelocity] = useState(3000.0);
  const [chamberPressure, setChamberPressure] = useState(100.0);
  const [nozzleExitArea, setNozzleExitArea] = useState(1.5);
  const [ambientPressure, setAmbientPressure] = useState(0.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const particleRefs = useRef([]);
  const gradientRef = useRef();
  const rocketPathRef = useRef();

  const instantaneousThrust = useMemo(() => {
    const pressureDiffPa = (chamberPressure - ambientPressure) * 101325;
    return propellantFlowRate * exhaustVelocity + pressureDiffPa * nozzleExitArea;
  }, [propellantFlowRate, exhaustVelocity, chamberPressure, ambientPressure, nozzleExitArea]);

  const specificImpulse = useMemo(() => exhaustVelocity / 9.81, [exhaustVelocity]);
  const massFlowMomentum = useMemo(() => propellantFlowRate * exhaustVelocity, [propellantFlowRate, exhaustVelocity]);
  const pressureThrustComponent = useMemo(() => (chamberPressure - ambientPressure) * 101325 * nozzleExitArea, [chamberPressure, ambientPressure, nozzleExitArea]);
  const rocketAcceleration = useMemo(() => instantaneousThrust / 100000, [instantaneousThrust]);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 35; i++) {
      arr.push({
        id: i,
        x: 480 + Math.random() * 20 - 10,
        y: 240 + Math.random() * 40 - 20,
        vx: 0,
        vy: 0,
        life: Math.random(),
        maxLife: 1,
        hue: 220,
        size: 2 + Math.random() * 3
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const updateParticles = () => {
        if (!isPlaying) return;
        particleRefs.current.forEach((ref, i) => {
          if (!ref) return;
          const p = particles[i];
          p.life -= 0.016;
          if (p.life <= 0) {
            p.life = 1;
            p.x = 480 + (Math.random() - 0.5) * 20;
            p.y = 240 + (Math.random() - 0.5) * 40;
            p.vx = (Math.random() - 0.5) * 2;
            p.vy = exhaustVelocity * 0.1 + Math.random() * 50;
            p.hue = 60;
          }
          p.x += p.vx * 0.16;
          p.y += p.vy * 0.16;
          p.vy += 20 * 0.16;
          p.hue = Math.max(20, 220 - (p.life * 200));
          p.size = 2 + (1 - p.life) * 3;
          ref.setAttribute("cx", p.x);
          ref.setAttribute("cy", p.y);
          ref.setAttribute("fill", `hsl(${p.hue}, 80%, ${60 + p.life * 40}%)`);
          ref.setAttribute("r", p.size);
        });
      };
      const tick = () => {
        updateParticles();
        requestAnimationFrame(tick);
      };
      tick();
      return () => ctx.revert();
    }, []);
  }, [isPlaying, particles, exhaustVelocity]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setPropellantFlowRate(250.0);
    setExhaustVelocity(3000.0);
    setChamberPressure(100.0);
    setNozzleExitArea(1.5);
    setAmbientPressure(0.0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white">Rocket Propulsion System: Thrust Generation and Momentum Conservation</h1>
        <p className="text-sm text-muted-foreground">Aerospace Engineering / Rocket Science</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">Instantaneous Thrust</div>
          <div className="text-2xl font-semibold">{Math.round(instantaneousThrust)} N</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">Specific Impulse</div>
          <div className="text-2xl font-semibold">{specificImpulse.toFixed(1)} s</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">Mass Flow Momentum</div>
          <div className="text-2xl font-semibold">{Math.round(massFlowMomentum)} N</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">Pressure Thrust Component</div>
          <div className="text-2xl font-semibold">{Math.round(pressureThrustComponent)} N</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">Rocket Acceleration</div>
          <div className="text-2xl font-semibold">{rocketAcceleration.toFixed(2)} m/s²</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="font-medium mb-1">Exhaust Momentum Rate</div>
          <div className="text-2xl font-semibold">{Math.round(propellantFlowRate * exhaustVelocity)} N</div>
        </div>
      </div>

      <div className="relative w-full h-[500px] bg-black/30 rounded-xl overflow-hidden">
        <svg viewBox="0 0 960 480" className="w-full h-full">
          <defs>
            <radialGradient id="combustionGradient" gradientUnits="userSpaceOnUse" cx="480" cy="240" r="0">
              <stop offset="0%" stopColor="#ffffcc" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ff6600" stopOpacity={0.3} />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ffcc00" floodOpacity="0.5" />
            </filter>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g className="stroke-muted/20">
            <path d="M0 240 L960 240" />
            <path d="M480 0 L480 480" />
            {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
              <line key={x} x1={x} y1={0} x2={x} y2={480} className="stroke-muted/10" />
            ))}
            {[100, 200, 300, 400].map(y => (
              <line key={y} x1={0} y1={y} x2={960} y2={y} className="stroke-muted/10" />
            ))}
          </g>

          {/* Layer 2: Primary Enclosure */}
          <path ref={rocketPathRef} d="M120 80 C180 40, 780 40, 840 80 L840 400 C780 440, 180 440, 120 400 Z" fill="none" stroke="#38bdf8" strokeWidth="3" className="stroke-muted/50" />

          {/* Layer 3: Active Volumetric Medium */}
          <ellipse ref={gradientRef} cx="480" cy="240" rx={40 + chamberPressure / 5} ry={20 + chamberPressure / 10} fill="url(#combustionGradient)" filter="url(#glow)" />

          {/* Layer 4: Kinetic Particles */}
          <g>
            {particles.map((p, i) => (
              <circle
                key={i}
                ref={ref => (particleRefs.current[i] = ref)}
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill={`hsl(${p.hue}, 80%, ${60 + p.life * 40}%)`}
              />
            ))}
          </g>

          {/* Layer 5: In-situ HUD */}
          <g className="text-white/80 text-sm">
            <text x="192" y="144">Chamber Pressure: {chamberPressure.toFixed(1)} atm</text>
            <text x="480" y="384" textAnchor="middle">Exhaust Velocity: {exhaustVelocity.toFixed(0)} m/s</text>
            <text x="480" y="420" textAnchor="middle" fill="#f43f5e">
              Thrust: {Math.round(instantaneousThrust)} N
            </text>
            <line x1="480" y1="400" x2="480" y2="300" stroke="#f43f5e" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <text x="768" y="96" textAnchor="end">Isp: {specificImpulse.toFixed(1)} s</text>
          </g>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium mb-1">Propellant Mass Flow Rate</label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={propellantFlowRate}
              onChange={e => setPropellantFlowRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{propellantFlowRate} kg/s</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Exhaust Velocity</label>
            <input
              type="range"
              min="2000"
              max="4500"
              step="50"
              value={exhaustVelocity}
              onChange={e => setExhaustVelocity(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{exhaustVelocity} m/s</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Combustion Chamber Pressure</label>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={chamberPressure}
              onChange={e => setChamberPressure(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{chamberPressure} atm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nozzle Exit Area</label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={nozzleExitArea}
              onChange={e => setNozzleExitArea(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{nozzleExitArea.toFixed(1)} m²</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ambient Pressure</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ambientPressure}
              onChange={e => setAmbientPressure(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{ambientPressure.toFixed(1)} atm</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-muted/50 hover:bg-muted/70 text-sm rounded-lg transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-muted/50 hover:bg-muted/70 text-sm rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Ignition and Combustion</h3>
          <p className="text-sm">
            Propellant and oxidizer mix in the combustion chamber, igniting to produce high-pressure, high-temperature gas. Chamber pressure drives the process.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Nozzle Acceleration</h3>
          <p className="text-sm">
            Hot gas expands through the de Laval nozzle, converting thermal energy to kinetic energy. Exhaust velocity increases as pressure drops, maximizing momentum transfer.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Thrust Generation</h3>
          <p className="text-sm">
            According to Newton's Third Law, the downward momentum of the exhaust creates an equal and opposite upward force on the rocket. Thrust depends on both mass flow rate and exhaust velocity.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Momentum Conservation in Vacuum</h3>
          <p className="text-sm">
            In space with no ambient pressure, thrust simplifies to F = ṁ * v_e. The rocket gains upward momentum exactly equal to the downward momentum of the exhaust, conserving total system momentum.
          </p>
        </div>
      </div>
    </div>
  );
}
