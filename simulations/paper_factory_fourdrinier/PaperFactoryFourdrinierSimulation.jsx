import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PaperFactoryFourdrinierSimulation() {
  const [stock_flow_rate, setStockFlowRate] = useState(150);
  const [wire_speed, setWireSpeed] = useState(20);
  const [slice_opening, setSliceOpening] = useState(2.0);
  const [vacuum_level, setVacuumLevel] = useState(0.4);
  const [couch_pressure, setCouchPressure] = useState(150);
  const [stock_consistency, setStockConsistency] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(true);
  const wireRef = useRef();
  const fiberRefs = useRef(Array.from({ length: 10 }, () => useRef()));
  const dropletRefs = useRef(Array.from({ length: 15 }, () => useRef()));
  const wireMarkerRefs = useRef(Array.from({ length: 5 }, () => useRef()));
  const couchNipRefs = useRef(Array.from({ length: 5 }, () => useRef()));
  const sliceLipRef = useRef();

  const jet_velocity = useMemo(() => {
    return Math.sqrt(2 * 9.81 * (slice_opening / 1000) * 1000) * 3.28084;
  }, [slice_opening]);

  const drainage_rate = useMemo(() => {
    return stock_flow_rate * stock_consistency * vacuum_level * 0.01;
  }, [stock_flow_rate, stock_consistency, vacuum_level]);

  const web_moisture = useMemo(() => {
    return Math.max(70, 95 - (wire_speed * 0.3 + vacuum_level * 20 + couch_pressure * 0.1));
  }, [wire_speed, vacuum_level, couch_pressure]);

  const formation_index = useMemo(() => {
    return Math.min(100, 50 + (wire_speed * 1.2) + (vacuum_level * 30));
  }, [wire_speed, vacuum_level]);

  const web_tension = useMemo(() => {
    return stock_flow_rate * 0.02 * wire_speed;
  }, [stock_flow_rate, wire_speed]);

  const suction_force = useMemo(() => {
    return vacuum_level * 101.325 * 0.5;
  }, [vacuum_level]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!isPlaying) return;

      // Wire markers translation
      wireMarkerRefs.current.forEach((ref, i) => {
        const marker = ref.current;
        if (!marker) return;
        gsap.to(marker, {
          x: "+=20",
          duration: 0.1,
          repeat: -1,
          ease: "none",
          modifiers: {
            x: (x) => {
              const wireLength = 600;
              return ((x - 100) % wireLength) + 100;
            }
          }
        });
      });

      // Couch nip scaleY (compression)
      couchNipRefs.current.forEach((ref) => {
        const nip = ref.current;
        if (!nip) return;
        gsap.to(nip, {
          scaleY: 0.2 + couch_pressure / 1500,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // Slice lip rotation (simulating flow)
      if (sliceLipRef.current) {
        gsap.to(sliceLipRef.current, {
          rotation: "+=2",
          duration: 0.1,
          repeat: -1,
          ease: "none"
        });
      }

      // Fibers translation and rotation (alignment)
      fiberRefs.current.forEach((ref, i) => {
        const fiber = ref.current;
        if (!fiber) return;
        gsap.to(fiber, {
          x: "+=15",
          duration: 0.08,
          repeat: -1,
          ease: "none",
          modifiers: {
            x: (x) => {
              const jetLength = 200;
              return ((x - 50) % jetLength) + 50;
            }
          },
          rotation: () => (Math.random() - 0.5) * 10
        });
      });

      // Water droplets translation (drainage)
      dropletRefs.current.forEach((ref, i) => {
        const droplet = ref.current;
        if (!droplet) return;
        gsap.to(droplet, {
          y: "+=8",
          duration: 0.12,
          repeat: -1,
          ease: "none",
          modifiers: {
            y: (y) => {
              const dropHeight = 100;
              return ((y - 200) % dropHeight) + 200;
            }
          },
          opacity: () => 0.3 + Math.random() * 0.4
        });
      });
    }, wireRef);

    return () => ctx.revert();
  }, [isPlaying, wire_speed, couch_pressure, vacuum_level]);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const resetDefaults = () => {
    setStockFlowRate(150);
    setWireSpeed(20);
    setSliceOpening(2.0);
    setVacuumLevel(0.4);
    setCouchPressure(150);
    setStockConsistency(0.4);
    setIsPlaying(true);
  };

  const gridPoints = useMemo(() => {
    const points = [];
    for (let x = 0; x <= 960; x += 20) {
      points.push([x, 0, x, 480]);
    }
    for (let y = 0; y <= 480; y += 20) {
      points.push([0, y, 960, y]);
    }
    return points;
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">
          Fourdrinier Paper Machine Simulation
        </h1>
        <p className="text-sm text-gray-400">
          Pulp and Paper Manufacturing - Wet End Operations
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
        {[
          { label: "Jet Velocity", value: jet_velocity.toFixed(1), unit: "ft/s" },
          { label: "Drainage Rate", value: drainage_rate.toFixed(2), unit: "kg/min" },
          { label: "Web Moisture", value: web_moisture.toFixed(1), unit: "%" },
          { label: "Formation Index", value: formation_index.toFixed(0), unit: "a.u." },
          { label: "Web Tension", value: web_tension.toFixed(1), unit: "N" },
          { label: "Suction Force", value: suction_force.toFixed(1), unit: "kPa" }
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm border border-gray-700/30"
          >
            <div className="text-xs text-gray-400 mb-1">{metric.label}</div>
            <div className="text-lg font-semibold text-white">{metric.value}</div>
            <div className="text-xs text-gray-300">{metric.unit}</div>
          </div>
        ))}
      </div>

      <div
        className="w-full min-h-[500px] h-[500px] bg-gray-900/30 rounded-xl overflow-hidden relative border border-gray-700/40 backdrop-blur-sm"
        ref={wireRef}
      >
        <svg
          viewBox="0 0 960 480"
          className="w-full h-full"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Defs */}
          <defs>
            <linearGradient id="stockGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a0c4ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f0f0f0" stopOpacity={0.8} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#38bdf8"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g className="text-gray-500/50">
            {gridPoints.map(([x1, y1, x2, y2], idx) => (
              <line key={`grid-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(56, 189, 248, 0.08)" strokeWidth={0.5}
              />
            ))}
          </g>

          {/* Layer 2: Primary Enclosure Silhouette */}
          <path d="M50 100 C150 50 300 50 400 100 L420 100 C450 80 500 80 530 100 L550 100 C580 80 630 80 660 100 L680 100 C710 80 760 80 790 100 L810 100 C840 80 890 80 920 100 L940 100 C950 120 950 180 930 220 L900 260 C880 300 820 340 750 340 L680 340 C610 340 550 300 500 260 L470 220 C450 180 450 120 470 100 L450 100 C430 80 380 80 350 100 L330 100 C300 80 250 80 220 100 L200 100 C180 80 130 80 100 100 L80 100 C60 120 60 180 80 220 L110 260 C140 300 200 340 270 340 L340 340 C410 340 470 300 520 260 L550 220 C570 180 570 120 550 100 Z" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth={2}
          />

          {/* Layer 3: Active Volumetric Medium */}
          <path d="M50 100 C150 50 300 50 400 100 L420 100 C450 80 500 80 530 100 L550 100 C580 80 630 80 660 100 L680 100 C710 80 760 80 790 100 L810 100 C840 80 890 80 920 100 L940 100 C950 120 950 180 930 220 L900 260 C880 300 820 340 750 340 L680 340 C610 340 550 300 500 260 L470 220 C450 180 450 120 470 100 L450 100 C430 80 380 80 350 100 L330 100 C300 80 250 80 220 100 L200 100 C180 80 130 80 100 100 L80 100 C60 120 60 180 80 220 L110 260 C140 300 200 340 270 340 L340 340 C410 340 470 300 520 260 L550 220 C570 180 570 120 550 100 Z" fill="url(#stockGradient)" filter="url(#glow)"
          />

          {/* Layer 4: Kinetic Actors and Particles */}
          {/* Fibers */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`fiber-${i}`} ref={fiberRefs.current[i]} x1={50 + Math.random() * 150} y1={80 + Math.random() * 40} x2={70 + Math.random() * 150} y2={100 + Math.random() * 40} stroke="white" strokeWidth={1.5} opacity={0.7}
            />
          ))}
          {/* Water Droplets */}
          {Array.from({ length: 15 }).map((_, i) => (
            <circle key={`droplet-${i}`} ref={dropletRefs.current[i]} cx={200 + Math.random() * 500} cy={200 + Math.random() * 100} r={2} fill="#38bdf8" opacity={0.5}
            />
          ))}
          {/* Wire Markers */}
          {Array.from({ length: 5 }).map((_, i) => (
            <circle key={`wire-marker-${i}`} ref={wireMarkerRefs.current[i]} cx={100 + i * 120} cy={100} r={3} fill="black"
            />
          ))}
          {/* Couch Nip Indicators */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`couch-nip-${i}`} ref={couchNipRefs.current[i]} x={700 + i * 20} y={220} width={10} height={20} fill="rgba(244, 63, 94, 0.6)"
            />
          ))}
          {/* Rotating Headbox Slice Lip */}
          <rect ref={sliceLipRef} x={30} y={80} width={20} height={40} fill="rgba(56, 189, 248, 0.6)"
          />
        </svg>

        {/* Layer 5: In-Situ HUD Instrumentation */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-start p-4">
          <div className="mb-2 text-sm text-white/90 bg-gray-800/50 px-2 py-1 rounded">
            Jet Velocity: {jet_velocity.toFixed(1)} ft/s
          </div>
          <div className="mb-2 text-sm text-white/90 bg-gray-800/50 px-2 py-1 rounded">
            Formation: {formation_index.toFixed(0)}%
          </div>
          <div className="mb-2 text-sm text-white/90 bg-gray-800/50 px-2 py-1 rounded">
            Drainage: {drainage_rate.toFixed(2)} kg/min
          </div>
          <div className="mb-2 text-sm text-white/90 bg-gray-800/50 px-2 py-1 rounded">
            Web Moisture: {web_moisture.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90 bg-gray-800/50 px-2 py-1 rounded">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Slice Opening: {slice_opening} mm</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Stock Flow Rate", param: "stock_flow_rate", min: 50, max: 300, step: 10, unit: "kg/min" },
            { label: "Wire Speed", param: "wire_speed", min: 5, max: 50, step: 1, unit: "m/min" },
            { label: "Slice Opening", param: "slice_opening", min: 0.5, max: 5.0, step: 0.1, unit: "mm" },
            { label: "Vacuum Level", param: "vacuum_level", min: 0.1, max: 0.8, step: 0.05, unit: "atm" },
            { label: "Couch Pressure", param: "couch_pressure", min: 50, max: 300, step: 10, unit: "kPa" },
            { label: "Stock Consistency", param: "stock_consistency", min: 0.2, max: 0.8, step: 0.05, unit: "%" }
          ].map(({ label, param, min, max, step, unit }) => (
            <div key={param} className="flex flex-col items-start">
              <label className="text-sm text-gray-300 mb-1">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={eval(param)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    switch (param) {
                      case "stock_flow_rate": setStockFlowRate(val); break;
                      case "wire_speed": setWireSpeed(val); break;
                      case "slice_opening": setSliceOpening(val); break;
                      case "vacuum_level": setVacuumLevel(val); break;
                      case "couch_pressure": setCouchPressure(val); break;
                      case "stock_consistency": setStockConsistency(val); break;
                    }
                  }}
                  className="w-40"
                />
                <span className="w-16 text-right text-xs text-gray-400">
                  {eval(param).toFixed(step < 1 ? 2 : 0)} {unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={resetDefaults}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {[
          {
            step: 1,
            title: "Stock Jet Impact",
            text: "The stock jet emerges from the headbox slice and impacts the moving wire. Jet velocity, determined by slice opening and stock consistency, governs fiber alignment and initial shear forces. Too high a velocity causes fiber damage and poor formation; too low leads to uneven distribution."
          },
          {
            step: 2,
            title: "Drainage and Formation",
            text: "As the stock travels on the wire, vacuum boxes apply suction, removing water through the forming web. Drainage rate depends on vacuum level, web permeability, and stock consistency. Formation index reflects the uniformity of the fiber network, improved by optimal drainage and wire speed."
          },
          {
            step: 3,
            title: "Web Consolidation at Couch",
            text: "The wet web is transferred from the wire to the felt via the couch roll nip. Couch pressure squeezes out additional water, reducing web moisture before the press section. Balanced pressure is critical: insufficient pressure leaves the web too wet for pressing; excessive pressure causes fiber damage and web tearing."
          }
        ].map(({ step, title, text }) => (
          <div
            key={step}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 backdrop-blur-sm"
          >
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <span className="bg-gray-700/50 text-xs px-2 py-0.5 rounded">{step}</span>
              <span>{title}</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
