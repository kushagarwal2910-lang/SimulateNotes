import React, { useState, useMemo, useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function PaperFactorySimulation() {
  const [refining_energy, setRefiningEnergy] = useState(150);
  const [moisture_content, setMoistureContent] = useState(5);
  const [drying_temp, setDryingTemp] = useState(120);
  const [fourdrinier_speed, setFourdrinierSpeed] = useState(300);
  const [fiber_length, setFiberLength] = useState(2.5);
  const [isPlaying, setIsPlaying] = useState(true);

  const tensile_strength_index = useMemo(
    () => Math.sqrt(refining_energy) * Math.pow(1 - moisture_content / 100, 2) * 0.01,
    [refining_energy, moisture_content]
  );
  const web_thickness_mm = useMemo(
    () => 4.5 / (1 + refining_energy / 200) * (1 + moisture_content / 20),
    [refining_energy, moisture_content]
  );
  const drying_rate_kg_m2s = useMemo(
    () => 0.001 * (drying_temp - 80) * Math.sqrt(fourdrinier_speed / 300),
    [drying_temp, fourdrinier_speed]
  );
  const energy_consumption_mj_ton = useMemo(
    () => refining_energy * 3.6 + 2000 * (drying_temp - 80) / 100,
    [refining_energy, drying_temp]
  );
  const production_rate_ton_hr = useMemo(
    () => fourdrinier_speed * 0.002 * (1 - moisture_content / 100),
    [fourdrinier_speed, moisture_content]
  );

  const svgRef = useRef(null);
  const webPathRef = useRef(null);
  const dryerShellRefs = useRef(Array(5).fill(null));
  const waterDropletRefs = useRef(Array(5).fill(null));
  const fiberParticleRefs = useRef(Array(10).fill(null));
  const pressNipRefs = useRef(Array(5).fill(null));
  const calenderSurfaceRefs = useRef(Array(5).fill(null));

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (webPathRef.current) {
        const pathLength = webPathRef.current.getTotalLength() || 1000;
        gsap.to(webPathRef.current, {
          strokeDashoffset: pathLength,
          duration: 0.1,
          repeat: -1,
          ease: "none",
        });
      }
      dryerShellRefs.current.forEach((ref, i) => {
        if (ref.current) {
          gsap.to(ref.current, {
            rotation: 360 * (fourdrinier_speed / 300),
            duration: 0.5,
            repeat: -1,
            transformOrigin: "center",
            ease: "none",
          });
        }
      });
      waterDropletRefs.current.forEach((ref) => {
        if (ref.current) {
          gsap.to(ref.current, {
            cy: gsap.utils.random(100, 220),
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      });
      fiberParticleRefs.current.forEach((ref) => {
        if (ref.current) {
          gsap.to(ref.current, {
            x: gsap.utils.random(400, 800),
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      });
      pressNipRefs.current.forEach((ref) => {
        if (ref.current) {
          gsap.to(ref.current, {
            y: gsap.utils.random(380, 420),
            duration: 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      });
      calenderSurfaceRefs.current.forEach((ref) => {
        if (ref.current) {
          gsap.to(ref.current, {
            rotation: 360 * (fourdrinier_speed / 300),
            duration: 0.5,
            repeat: -1,
            transformOrigin: "center",
            ease: "none",
          });
        }
      });
    }, svgRef);

    return () => ctx.revert();
  }, [
    refining_energy,
    moisture_content,
    drying_temp,
    fourdrinier_speed,
    fiber_length,
    isPlaying,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      gsap.ticker.pause();
    } else {
      gsap.ticker.play();
    }
  }, [isPlaying]);

  const resetDefaults = () => {
    setRefiningEnergy(150);
    setMoistureContent(5);
    setDryingTemp(120);
    setFourdrinierSpeed(300);
    setFiberLength(2.5);
    setIsPlaying(true);
  };

  const telemetryMetrics = [
    { label: "Tensile Strength Index", value: tensile_strength_index.toFixed(2), unit: "kN/m" },
    { label: "Web Thickness", value: web_thickness_mm.toFixed(2), unit: "mm" },
    { label: "Drying Rate", value: drying_rate_kg_m2s.toFixed(6), unit: "kg/m²·s" },
    { label: "Energy Consumption", value: energy_consumption_mj_ton.toFixed(0), unit: "MJ/ton" },
    { label: "Production Rate", value: production_rate_ton_hr.toFixed(1), unit: "ton/hr" },
    { label: "Web Moisture", value: moisture_content.toFixed(1), unit: "%" },
  ];

  const educationalCards = [
    {
      step: 1,
      title: "Stock Preparation & Refining",
      text: "Wood chips or recycled fiber are pulped and refined. Increasing refining energy fibrillates fibers, increasing surface area for bonding but also energy consumption. Optimal refining balances strength development with drainage resistance.",
    },
    {
      step: 2,
      title: "Sheet Formation on Fourdrinier Wire",
      text: "Diluted stock (0.5% consistency) is jetted onto a moving wire. Water drains by gravity and vacuum, forming a fragile web. Fourdrinier speed determines production rate and influences fiber orientation and formation quality.",
    },
    {
      step: 3,
      title: "Pressing and Drying Sections",
      text: "The wet web passes through nips of press rolls to remove water mechanically, then through steam-heated dryer cylinders where evaporation completes moisture removal. Dryer temperature and web residence time dictate final moisture content and energy efficiency.",
    },
    {
      step: 4,
      title: "Calendering and Reeling",
      text: "The dry web passes through calender rolls to smooth surface and control thickness. Finally, it is wound onto a reel. Final paper properties depend on the entire process history, particularly refining and drying conditions.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Industrial Paper Factory: From Pulp to Finished Roll</h1>
        <p className="text-gray-400 mt-2">
          Demonstrates core unit operations: pulping, refining, sheet formation, pressing, drying, and calendering.
        </p>
        <span className="inline-block mt-3 px-3 py-1 bg-gray-800/50 rounded-full text-sm">
          {isPlaying ? "Running" : "Paused"}
        </span>
      </header>

      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
        {telemetryMetrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50"
          >
            <div className="text-gray-400 text-sm mb-1">{metric.label}</div>
            <div className="text-2xl font-mono">{metric.value}</div>
            <div className="text-gray-500 text-xs">{metric.unit}</div>
          </div>
        ))}
      </div>

      <div className="relative h-[500px] w-full mb-6 bg-gray-800/30 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 960 480"
          className="w-full h-full"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          <defs>
            <linearGradient id="machineBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>
            <linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
            </linearGradient>
            <filter id="webGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="5"
                floodColor="#38bdf8"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g className="stroke-gray-600/20 stroke-[0.5]">
            {/* Factory floor grid */}
            {[...Array(20)].map((_, i) => (
              <line key={`hgrid-${i}`} x1="0" y1={i * 24} x2="960" y2={i * 24}
              />
            ))}
            {[...Array(48)].map((_, i) => (
              <line key={`vgrid-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="480"
              />
            ))}
            {/* Structural columns */}
            {[100, 300, 500, 700, 900].map((x) => (
              <rect key={`col-${x}`} x={x - 5} y="300" width="10" height="180" fill="#1a202c"
              />
            ))}
            {/* Overhead crane rails */}
            <line x1="50" y1="50" x2="910" y2="50" stroke="#4a5568" strokeWidth="2" />
            <line x1="50" y1="70" x2="910" y2="70" stroke="#4a5568" strokeWidth="2" />
          </g>

          {/* Layer 2: Primary Enclosure Silhouette */}
          <path d="M50 400 C50 200 200 100 400 100 S750 100 900 200 C900 300 800 380 700 400 L500 400 C450 380 350 380 300 400 Z" fill="url(#machineBodyGradient)" stroke="#4a5568" strokeWidth="3"
          />

          {/* Layer 3: Active Volumetric Medium (Paper Web) */}
          <path ref={webPathRef} d="M400 100 Q450 80 500 100 T600 100 T700 100 T800 100" fill="url(#webGradient)" opacity="0.8" stroke="none" filter="url(#webGlow)"
          />

          {/* Layer 4: Kinetic Actors and Particles */}
          {/* Fiber Particles */}
          {[...Array(10)].map((_, i) => (
            <circle
              key={`fiber-${i}`}
              ref={(el) => (fiberParticleRefs.current[i] = el)}
              cx={400 + i * 20}
              cy={120}
              r="1.5"
              fill="#fbbf24"
            />
          ))}
          {/* Water Droplets */}
          {[...Array(5)].map((_, i) => (
            <circle
              key={`water-${i}`}
              ref={(el) => (waterDropletRefs.current[i] = el)}
              cx={450 + i * 50}
              cy={150}
              r="1"
              fill="#60a5fa"
            />
          ))}
          {/* Dryer Shells */}
          {[...Array(5)].map((_, i) => (
            <path
              key={`dryer-${i}`}
              ref={(el) => (dryerShellRefs.current[i] = el)}
              d={`M${500 + i * 80},-10 A10,10 0 0,1 ${500 + i * 80},10 A10,10 0 0,1 ${500 + i * 80},-10 Z`}
              fill="#ef4444"
            />
          ))}
          {/* Press Nips */}
          {[...Array(5)].map((_, i) => (
            <rect
              key={`press-${i}`}
              ref={(el) => (pressNipRefs.current[i] = el)}
              x={450 + i * 90}
              y={380}
              width="8"
              height="4"
              fill="#6b7280"
            />
          ))}
          {/* Calender Surfaces */}
          {[...Array(5)].map((_, i) => (
            <rect
              key={`calender-${i}`}
              ref={(el) => (calenderSurfaceRefs.current[i] = el)}
              x={750 + i * 20}
              y={350}
              width="12"
              height="2"
              fill="#9ca3af"
            />
          ))}
        </svg>

        {/* Layer 5: In-situ HUD Instrumentation */}
        <g className="text-gray-100/80">
          <text
            x="200"
            y="150"
            fill="#1e293b"
            fillOpacity="0.8"
            stroke="#334155"
            strokeWidth="1"
          >
            <tspan x="200" dy="0">Refining:</tspan>
            <tspan x="260" dy="0">{refining_energy} kWh/ton</tspan>
          </text>
          <text
            x="500"
            y="220"
            fill="#1e293b"
            fillOpacity="0.8"
            stroke="#334155"
            strokeWidth="1"
          >
            <tspan x="500" dy="0">Moisture:</tspan>
            <tspan x="560" dy="0">{moisture_content}%</tspan>
          </text>
          <text
            x="650"
            y="180"
            fill="#1e293b"
            fillOpacity="0.8"
            stroke="#334155"
            strokeWidth="1"
          >
            <tspan x="650" dy="0">Dryer Temp:</tspan>
            <tspan x="730" dy="0">{drying_temp}°C</tspan>
          </text>
          <text
            x="800"
            y="300"
            fill="#1e293b"
            fillOpacity="0.8"
            stroke="#334155"
            strokeWidth="1"
          >
            <tspan x="800" dy="0">Basis Weight:</tspan>
            <tspan x="880" dy="0">
              {(production_rate_ton_hr * 1000 / 60).toFixed(0)} g/m²
            </tspan>
          </text>
          <text
            x="850"
            y="380"
            fill="#1e293b"
            fillOpacity="0.8"
            stroke="#334155"
            strokeWidth="1"
          >
            <tspan x="850" dy="0">Tensile:</tspan>
            <tspan x="910" dy="0">{tensile_strength_index.toFixed(2)} kN/m</tspan>
          </text>
        </g>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium mb-1">Refining Energy</label>
            <div className="flex items-center">
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={refining_energy}
                onChange={(e) => setRefiningEnergy(Number(e.target.value))}
                className="w-32 h-4 bg-gray-700 rounded"
              />
              <span className="ml-2 w-16 text-right">{refining_energy} kWh/ton</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Moisture</label>
            <div className="flex items-center">
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={moisture_content}
                onChange={(e) => setMoistureContent(Number(e.target.value))}
                className="w-32 h-4 bg-gray-700 rounded"
              />
              <span className="ml-2 w-16 text-right">{moisture_content}%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Drying Temperature</label>
            <div className="flex items-center">
              <input
                type="range"
                min="80"
                max="160"
                step="5"
                value={drying_temp}
                onChange={(e) => setDryingTemp(Number(e.target.value))}
                className="w-32 h-4 bg-gray-700 rounded"
              />
              <span className="ml-2 w-16 text-right">{drying_temp}°C</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Machine Speed</label>
            <div className="flex items-center">
              <input
                type="range"
                min="100"
                max="600"
                step="20"
                value={fourdrinier_speed}
                onChange={(e) => setFourdrinierSpeed(Number(e.target.value))}
                className="w-32 h-4 bg-gray-700 rounded"
              />
              <span className="ml-2 w-16 text-right">{fourdrinier_speed} m/min</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fiber Length</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={fiber_length}
                onChange={(e) => setFiberLength(Number(e.target.value))}
                className="w-32 h-4 bg-gray-700 rounded"
              />
              <span className="ml-2 w-16 text-right">{fiber_length} mm</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 rounded text-sm"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetDefaults}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 rounded text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {educationalCards.map((card) => (
          <div
            key={card.step}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          >
            <h3 className="font-semibold mb-2 text-gray-200">
              Step {card.step}: {card.title}
            </h3>
            <p className="text-gray-400 text-sm">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
