import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function SimSimulateCentrifugalPumpImpellSimulation() {
  const [driveRate, setDriveRate] = useState(50);
  const [flowVelocity, setFlowVelocity] = useState(8);
  const [densityFactor, setDensityFactor] = useState(1.5);

  const effectiveFlux = useMemo(() => driveRate * flowVelocity * 0.12, [driveRate, flowVelocity]);
  const kineticIntensity = useMemo(() => 0.5 * densityFactor * Math.pow(flowVelocity, 2), [densityFactor, flowVelocity]);

  const particlesRef = useRef([]);
  const gsapContextRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const particleCount = 35;
      if (particlesRef.current.length === 0) {
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const radius = 200 + Math.random() * 50;
          const x = 480 + Math.cos(angle) * radius;
          const y = 240 + Math.sin(angle) * radius;
          const speed = 0.5 + Math.random() * 1.5;
          particlesRef.current.push({ id: i, x, y, angle, speed, radius: 2 + Math.random() * 3 });
        }
      }

      function tick() {
        const time = Date.now() * 0.001;
        const baseAngularSpeed = (driveRate / 50) * 0.5;
        const flowInfluence = flowVelocity / 10;
        const densityInfluence = densityFactor / 2;

        particlesRef.current.forEach(p => {
          p.angle += baseAngularSpeed * (1 + flowInfluence) * (1 + densityInfluence * 0.5) * 0.016;
          p.speed = 0.5 + flowInfluence * 2 + densityInfluence;
          p.x = 480 + Math.cos(p.angle) * (200 + p.speed * 20);
          p.y = 240 + Math.sin(p.angle) * (200 + p.speed * 20);
        });
      }

      gsap.ticker.add(tick);
      
      
      
      return () => gsap.ticker.remove(tick);
    }, gsapContextRef.current);

    return () => ctx.revert();
  }, [driveRate, flowVelocity, densityFactor]);

  const fluidPath = useMemo(() => {
    const flux = effectiveFlux;
    const height = 120 + flux * 0.8;
    const waveOffset = Math.sin(Date.now() * 0.002) * 10;
    return `M 200 360 
            C 250 ${300 - height + waveOffset} 
              350 ${300 - height + waveOffset} 
              400 360 
            L 560 360 
            C 510 ${300 + height - waveOffset} 
              410 ${300 + height - waveOffset} 
              360 360 Z`;
  }, [effectiveFlux]);

  const hullPath = useMemo(() => {
    return `M 180 80 
            C 250 40 
              430 40 
              500 80 
            L 700 80 
            C 770 40 
              850 40 
              920 80 
            L 920 380 
            C 850 340 
              770 340 
              700 380 
            L 500 380 
            C 430 340 
              350 340 
              280 380 
            L 180 380 Z`;
  }, []);

  const gridLines = [];
  for (let i = 0; i <= 20; i++) {
    const x = 50 + i * 45;
    gridLines.push(<line key={`v-${i}`} x1={x} y1={50} x2={x} y2={430} stroke="#334155" strokeWidth={0.5} />);
  }
  for (let i = 0; i <= 10; i++) {
    const y = 50 + i * 40;
    gridLines.push(<line key={`h-${i}`} x1={50} y1={y} x2={910} y2={y} stroke="#334155" strokeWidth={0.5} />);
  }

  const particles = particlesRef.current.map(p => (
    <circle key={p.id} cx={p.x} cy={p.y} r={p.radius} fill="url(#particleGradient)" />
  ));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Simulate Centrifugal Pump Impeller & Fluid Dynamics</h2>
        <p className="text-sm text-gray-400">Interactive 60 FPS computational simulation demonstrating the physical dynamics and governing equations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-center text-sm">
        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="text-gray-400">Effective Flux</div>
          <div className="text-2xl font-semibold text-white">{effectiveFlux.toFixed(2)}</div>
          <div className="text-xs text-gray-400">a.u.</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="text-gray-400">Kinetic Intensity</div>
          <div className="text-2xl font-semibold text-white">{kineticIntensity.toFixed(2)}</div>
          <div className="text-xs text-gray-400">J/m³</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3">
          <div className="text-gray-400">Flow Regime</div>
          <div className="text-lg font-semibold text-white">
            {flowVelocity > 15 ? "Turbulent" : flowVelocity > 8 ? "Transitional" : "Laminar"}
          </div>
          <div className="text-xs text-gray-400">Re ≈ {(flowVelocity * densityFactor * 0.1).toFixed(0)}</div>
        </div>
      </div>

      <div className="relative w-full h-[500px] min-h-[500px] bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 960 480">
          <defs>
            <linearGradient id="fluidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <radialGradient id="particleGradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.7" />
            </filter>
          </defs>

          {gridLines}

          <path d={hullPath} fill="none" stroke="#64748b" strokeWidth={2} opacity={0.7} />

          <path d={fluidPath} fill="url(#fluidGradient)" opacity={0.6} />

          {particles}
        </svg>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Drive Rate</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={driveRate}
              onChange={(e) => setDriveRate(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded"
            />
            <span className="w-12 text-right text-gray-300 text-xs">{driveRate}</span>
            <span className="text-gray-400 text-xs">a.u.</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Flow Velocity</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={flowVelocity}
              onChange={(e) => setFlowVelocity(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded"
            />
            <span className="w-12 text-right text-gray-300 text-xs">{flowVelocity.toFixed(1)}</span>
            <span className="text-gray-400 text-xs">m/s</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Medium Density</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.1}
              value={densityFactor}
              onChange={(e) => setDensityFactor(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded"
            />
            <span className="w-12 text-right text-gray-300 text-xs">{densityFactor.toFixed(1)}</span>
            <span className="text-gray-400 text-xs">kg/m³</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">Dynamic Equilibrium</h3>
          <p className="text-gray-300 text-sm">
            Adjusting flow velocity accelerates kinetic intensity nonlinearly via v² scaling.
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">Flux Saturation</h3>
          <p className="text-gray-300 text-sm">
            High drive rates saturate the effective flux through the volumetric enclosure.
          </p>
        </div>
      </div>
    </div>
  );
}
