import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function TestSimulation() {
  const [scaleFactor, setScaleFactor] = useState(1.5);
  const [decayRate, setDecayRate] = useState(0.3);
  const [frequency, setFrequency] = useState(0.5);
  const [amplitude, setAmplitude] = useState(100);
  const [baseOpacity, setBaseOpacity] = useState(0.7);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const particleContainerRef = useRef(null);
  const gsapContextRef = useRef(null);

  const scaledOutput = useMemo(() => scaleFactor * 100, [scaleFactor]);
  const mediumOpacity = useMemo(() => baseOpacity * Math.exp(-decayRate * timeElapsed), [baseOpacity, decayRate, timeElapsed]);
  const particleX = useMemo(() => amplitude * Math.sin(2 * Math.PI * frequency * timeElapsed) + 480, [amplitude, frequency, timeElapsed]);
  const particleY = useMemo(() => amplitude * Math.cos(2 * Math.PI * frequency * timeElapsed) + 240, [amplitude, frequency, timeElapsed]);
  const gradientStop1 = useMemo(() => Math.min(1, scaledOutput / 200), [scaledOutput]);
  const gradientStop2 = useMemo(() => Math.max(0, 1 - scaledOutput / 300), [scaledOutput]);
  const particleCount = useMemo(() => Math.floor(20 + scaleFactor * 10), [scaleFactor]);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < particleCount; i++) {
      arr.push({
        id: i,
        phase: (i / particleCount) * Math.PI * 2,
        offset: Math.random() * 0.5
      });
    }
    return arr;
  }, [particleCount]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isPlaying) {
        gsap.ticker.add(tick);
      }
    }, particleContainerRef.current);
    gsapContextRef.current = ctx;
    return () => {
      gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, [isPlaying]);

  const tick = () => {
    setTimeElapsed(prev => prev + 0.016);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      gsap.ticker.add(tick);
    } else {
      gsap.ticker.remove(tick);
    }
  };

  const handleReset = () => {
    setScaleFactor(1.5);
    setDecayRate(0.3);
    setFrequency(0.5);
    setAmplitude(100);
    setBaseOpacity(0.7);
    setTimeElapsed(0);
    setIsPlaying(false);
    gsap.ticker.remove(tick);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Test Simulation for Validation</h1>
        <p className="text-sm text-gray-400">General Testing and Validation Framework</p>
      </header>

      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
        {[ 
          { label: "Scaled Output Value", value: scaledOutput.toFixed(2), unit: "a.u." },
          { label: "Medium Opacity", value: mediumOpacity.toFixed(3), unit: "" },
          { label: "Particle Count", value: particleCount, unit: "" },
          { label: "X-Position Amplitude", value: amplitude.toFixed(0), unit: "px" },
          { label: "Frequency Domain", value: (frequency * 2 * Math.PI).toFixed(2), unit: "rad/s" },
          { label: "Decay Time Constant", value: (1 / decayRate).toFixed(2), unit: "s" }
        ].map((metric, index) => (
          <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
            <p className="text-lg font-mono">{metric.value} {metric.unit}</p>
          </div>
        ))}
      </div>

      <div className="relative w-full h-[500px] min-h-[500px] bg-gray-900 rounded-xl overflow-hidden mb-6">
        <svg viewBox="0 0 960 480" className="w-full h-full">
          {/* Layer 1: Environment Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="0.5"/>
            </pattern>
            <linearGradient id="mediumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.6)" stopOpacity={mediumOpacity}/>
              <stop offset="100%" stopColor="rgba(244,63,94,0.4)" stopOpacity={mediumOpacity}/>
            </linearGradient>
            <filter id="glowPulse">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
          <line x1="0" y1="240" x2="960" y2="240" stroke="rgba(56,189,248,0.2)" strokeWidth="1"/>
          <line x1="480" y1="0" x2="480" y2="480" stroke="rgba(56,189,248,0.2)" strokeWidth="1"/>
          <text x="10" y="230" fill="rgba(56,189,248,0.5)" fontSize="10">X-Axis</text>
          <text x="490" y="20" fill="rgba(56,189,248,0.5)" fontSize="10" transform="rotate(-90 490,20)">Y-Axis</text>

          {/* Layer 2: Primary Enclosure Silhouette */}
          <path d="M140 60 C140 30, 340 30, 340 60 L620 60 C620 30, 820 30, 820 60 L880 120 C880 150, 880 330, 880 360 L820 420 C820 450, 620 450, 620 420 L340 420 C340 450, 140 450, 140 420 L80 360 C80 330, 80 150, 80 120 Z" fill="rgba(30,35,50,0.8)" stroke="rgba(56,189,248,0.4)" strokeWidth="2"/>

          {/* Layer 3: Active Volumetric Medium */}
          <rect x="160" y="100" width="640" height="280" fill="url(#mediumGrad)" filter="url(#glowPulse)"/>

          {/* Layer 4: Kinetic Actors and Particles */}
          <g id="particleContainer" ref={particleContainerRef}>
            {particles.map(p => (
              <circle key={p.id} cx={particleX + Math.sin(p.phase + timeElapsed * frequency * Math.PI * 2) * amplitude * 0.5} cy={particleY + Math.cos(p.phase + timeElapsed * frequency * Math.PI * 2) * amplitude * 0.5} r={3} fill="url(#mediumGrad)"
              />
            ))}
          </g>

          {/* Layer 5: In-situ Instrumentation Callouts */}
          <g id="instrumentationHUD">
            <rect x="20" y="20" width="220" height="80" fill="rgba(0,0,0,0.6)" rx="8"/>
            <text x="30" y="40" fill="#38bdf8" fontSize="12" fontFamily="monospace">scale_factor = {scaleFactor.toFixed(2)}</text>
            <text x="30" y="58" fill="#38bdf8" fontSize="12" fontFamily="monospace">decay_rate = {decayRate.toFixed(3)}</text>
            <text x="30" y="76" fill="#38bdf8" fontSize="12" fontFamily="monospace">frequency = {frequency.toFixed(3)}</text>
            <rect x="720" y="20" width="220" height="80" fill="rgba(0,0,0,0.6)" rx="8"/>
            <text x="730" y="40" fill="#f43f5e" fontSize="12" fontFamily="monospace">scaled_output = {scaledOutput.toFixed(2)}</text>
            <text x="730" y="58" fill="#f43f5e" fontSize="12" fontFamily="monospace">medium_opacity = {mediumOpacity.toFixed(3)}</text>
            <text x="730" y="76" fill="#f43f5e" fontSize="12" fontFamily="monospace">particle_count = {particleCount}</text>
          </g>
        </svg>
      </div>

      <div className="grid gap-4 mb-6 sm:grid-cols-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Scale Multiplier</label>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Decay Rate (1/s)</label>
          <input
            type="range"
            min="0.01"
            max="2.0"
            step="0.01"
            value={decayRate}
            onChange={(e) => setDecayRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Frequency (Hz)</label>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.05"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Amplitude (px)</label>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Base Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={baseOpacity}
            onChange={(e) => setBaseOpacity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handlePlayPause}
          className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/70 text-sm rounded-lg transition-colors border border-gray-700/50"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/70 text-sm rounded-lg transition-colors border border-gray-700/50"
        >
          Reset to Defaults
        </button>
      </div>

      <div className="grid gap-4 mt-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map(step => (
          <div key={step} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2">
              Step {step}: 
              {step === 1 ? "Initial State" : step === 2 ? "Parameter Interaction" : step === 3 ? "Oscillatory Behavior" : "System Equilibrium"}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {step === 1
                ? "The system starts with default parameters: scale_factor=1.5, decay_rate=0.3, frequency=0.5Hz. Observe the medium's base color and the particle motion establishing the baseline behavior."
                : step === 2
                ? "Increasing scale_factor amplifies the output signal and increases particle count. Adjusting decay_rate controls how quickly the medium's opacity diminishes over time, demonstrating exponential decay dynamics."
                : step === 3
                ? "Modifying frequency and amplitude directly controls the particles' trajectory speed and radius. The Lissajous-like patterns emerge from the phase-shifted sine and cosine functions in the derived formulas."
                : "At steady state, the telemetry metrics reflect the balanced interaction of all parameters. The system demonstrates how multiple physical processes (scaling, decay, oscillation) can be simultaneously controlled and observed in a unified framework."
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
