import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function SteamTurbineEngineSimulation() {
  // State variables from specification
  const [inletPressure, setInletPressure] = useState(10.0);
  const [inletTemperature, setInletTemperature] = useState(500.0);
  const [massFlowRate, setMassFlowRate] = useState(50.0);
  const [loadTorque, setLoadTorque] = useState(1000.0);
  const [governorGain, setGovernorGain] = useState(0.8);
  const [exhaustPressure, setExhaustPressure] = useState(0.01);
  const [isPlaying, setIsPlaying] = useState(true);

  // Derived dynamics (all formulas from specification)
  const inletEnthalpy = useMemo(() => {
    return 2500 + 2.1 * inletTemperature + 0.001 * inletPressure * 1000;
  }, [inletTemperature, inletPressure]);

  const isentropicEnthalpyDrop = useMemo(() => {
    const h2s = 191.8 + 0.001 * exhaustPressure * 1e6 * 2.1 * (inletTemperature + 273);
    return (inletEnthalpy - h2s) * 0.85;
  }, [inletEnthalpy, exhaustPressure, inletTemperature]);

  const actualEnthalpyDrop = useMemo(() => {
    return isentropicEnthalpyDrop * 0.88;
  }, [isentropicEnthalpyDrop]);

  const turbinePower = useMemo(() => {
    return massFlowRate * actualEnthalpyDrop * 1000;
  }, [massFlowRate, actualEnthalpyDrop]);

  const rotationalSpeed = useMemo(() => {
    const speedFactor = Math.sqrt(turbinePower / 0.05);
    const errorFactor = Math.max(0, (turbinePower / loadTorque - 1800) / 1800);
    return speedFactor * (1 - governorGain * errorFactor);
  }, [turbinePower, loadTorque, governorGain]);

  const governorSleevePosition = useMemo(() => {
    return governorGain * Math.max(0, (rotationalSpeed - 1800) / 1800) * 10;
  }, [governorGain, rotationalSpeed]);

  const throttleValveOpening = useMemo(() => {
    return Math.max(0.1, Math.min(1.0, 1 - governorSleevePosition / 15));
  }, [governorSleevePosition]);

  const effectiveMassFlow = useMemo(() => {
    return massFlowRate * throttleValveOpening;
  }, [massFlowRate, throttleValveOpening]);

  const stageEfficiency = useMemo(() => {
    return 0.82 + 0.1 * Math.sin(Math.PI * inletPressure / 20);
  }, [inletPressure]);

  const exhaustQuality = useMemo(() => {
    return Math.max(0.8, Math.min(0.98, 0.85 + 0.001 * (inletTemperature - 300)));
  }, [inletTemperature]);

  // Telemetry metrics
  const thermalPowerInput = useMemo(() => {
    return (massFlowRate * inletEnthalpy * 1000) / 1e6;
  }, [massFlowRate, inletEnthalpy]);

  const mechanicalPowerOutput = useMemo(() => {
    return turbinePower / 1e6;
  }, [turbinePower]);

  const turbineEfficiency = useMemo(() => {
    return turbinePower / (massFlowRate * inletEnthalpy * 1000);
  }, [turbinePower, massFlowRate, inletEnthalpy]);

  const steamVelocity = useMemo(() => {
    return Math.sqrt(2 * actualEnthalpyDrop * 1000);
  }, [actualEnthalpyDrop]);

  const governorError = useMemo(() => {
    return rotationalSpeed - 1800;
  }, [rotationalSpeed]);

  const condenserVacuum = useMemo(() => {
    return 0.1013 - exhaustPressure;
  }, [exhaustPressure]);

  // Precompute particle paths and rotor positions for Frame 0 declarative curves
  const particlePaths = useMemo(() => {
    const paths = [];
    const centerX = 480;
    const centerY = 240;
    const radius = 150;
    const particleCount = 32;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const startX = centerX + radius * 0.5 * Math.cos(angle);
      const startY = centerY + radius * 0.5 * Math.sin(angle);
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);
      // Create a curved path (arc) for more realistic particle trace
      const path = `M ${startX} ${startY} A ${radius * 0.5} ${radius * 0.5} 0 0 1 ${endX} ${endY}`;
      paths.push({ id: i, path, progress: 0 });
    }
    return paths;
  }, []);

  // Blade angles for each rotor disk (8 disks, 12 blades each)
  const bladeAngles = useMemo(() => {
    const disks = 8;
    const bladesPerDisk = 12;
    const angles = [];
    for (let d = 0; d < disks; d++) {
      for (let b = 0; b < bladesPerDisk; b++) {
        angles.push((b / bladesPerDisk) * Math.PI * 2 + d * 0.1);
      }
    }
    return angles;
  }, []);

  // Refs for GSAP context and SVG elements
  const stageRef = useRef(null);
  const gsapContextRef = useRef(null);

  // GSAP animations setup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate rotor disks rotation
      const rotorDisks = stageRef.current?.querySelectorAll(".rotor-disk") || [];
      rotorDisks.forEach((disk, index) => {
        gsap.to(disk, {
          rotation: () => rotationalSpeed * 0.1047 * (index + 1), // slight variation per disk
          ease: "none",
          duration: 0.1,
          repeat: -1,
        });
      });

      // Animate steam particles along their paths
      const particles = stageRef.current?.querySelectorAll(".steam-particle") || [];
      particles.forEach((particle, index) => {
        const path = particlePaths[index % particlePaths.length].path;
        gsap.to(particle, {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
          },
          duration: 2 / (effectiveMassFlow / 50), // faster with higher flow
          repeat: -1,
          ease: "none",
        });
      });

      // Animate governor sleeve position
      const governorSleeve = stageRef.current?.querySelector("#governor-sleeve");
      if (governorSleeve) {
        gsap.to(governorSleeve, {
          y: -governorSleevePosition,
          duration: 0.5,
          ease: "power1.out",
        });
      }

      // Animate throttle valve position
      const throttleValve = stageRef.current?.querySelector("#throttle-valve");
      if (throttleValve) {
        gsap.to(throttleValve, {
          x: (1 - throttleValveOpening) * 20,
          duration: 0.5,
          ease: "power1.out",
        });
      }
    }, stageRef);

    return () => ctx.revert();
  }, [
    rotationalSpeed,
    effectiveMassFlow,
    governorSleevePosition,
    throttleValveOpening,
    particlePaths,
  ]);

  // Play/pause control for GSAP ticker (optional, but we keep animation running via repeat:-1)
  // We'll use a simple flag to control if we want to pause animations (by setting timeScale)
  useEffect(() => {
    if (isPlaying) {
      gsap.globalTimeline.timeScale(1);
    } else {
      gsap.globalTimeline.timeScale(0);
    }
  }, [isPlaying]);

  // Reset to defaults
  const resetToDefaults = () => {
    setInletPressure(10.0);
    setInletTemperature(500.0);
    setMassFlowRate(50.0);
    setLoadTorque(1000.0);
    setGovernorGain(0.8);
    setExhaustPressure(0.01);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Multi-Stage Steam Turbine Engine with Governing System</h1>
        <p className="text-sm text-gray-400">
          Thermodynamics & Power Generation Engineering
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 bg-gray-800/50 rounded text-xs">
            {isPlaying ? "Running" : "Paused"}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Telemetry HUD Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Thermal Power Input", value: thermalPowerInput.toFixed(1), unit: "MW" },
          { label: "Mechanical Power Output", value: mechanicalPowerOutput.toFixed(1), unit: "MW" },
          { label: "Turbine Efficiency", value: (turbineEfficiency * 100).toFixed(1), unit: "%" },
          { label: "Steam Velocity at Nozzle Exit", value: steamVelocity.toFixed(0), unit: "m/s" },
          { label: "Governor Error (RPM - 1800)", value: governorError.toFixed(0), unit: "rpm" },
          { label: "Condenser Vacuum", value: condenserVacuum.toFixed(3), unit: "MPa" },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50"
          >
            <div className="text-sm font-medium text-gray-400">{metric.label}</div>
            <div className="text-2xl font-bold text-white mt-1">
              {metric.value} <span className="text-sm">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dedicated Simulation Stage */}
      <div className="w-full h-[500px] min-h-[500px] bg-gray-900/50 rounded-xl overflow-hidden relative border border-gray-700/50">
        <svg
          ref={stageRef}
          viewBox="0 0 960 480"
          className="w-full h-full"
          style={{ backgroundColor: "#0b0f19" }}
        >
          {/* Defs for gradients and filters */}
          <defs>
            <linearGradient id="steamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#a5b4fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.1" />
            </linearGradient>
            <filter id="steamGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              <feFlood floodColor="#38bdf8" floodOpacity="0.2" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g className="stroke-gray-700/20">
            {/* Vertical grid lines */}
            {[...Array(25)].map((_, i) => (
              <line key={i} x1={i * 40} y1={0} x2={i * 40} y2={480} strokeWidth={1}
              />
            ))}
            {/* Horizontal grid lines */}
            {[...Array(13)].map((_, i) => (
              <line key={i} x1={0} y1={i * 40} x2={960} y2={i * 40} strokeWidth={1}
              />
            ))}
            {/* Axis labels */}
            <text x="20" y="20" fill="gray-500" fontSize="10">Pressure (MPa)</text>
            <text x="20" y="460" fill="gray-500" fontSize="10">Temperature (°C)</text>
          </g>

          {/* Layer 2: Primary Enclosure Silhouette */}
          <path d="M120 80 C180 40, 300 40, 360 80 L600 80 C660 40, 780 40, 840 80 L840 400 C780 440, 660 440, 600 400 L360 400 C300 440, 180 440, 120 400 Z" fill="none" stroke="#38bdf8" strokeWidth={2} className="drop-shadow-lg"
          />

          {/* Inlet volute and exhaust diffuser details */}
          <path d="M100 80 Q80 60 80 40 L80 20 Q60 10 40 10 L20 10 Q0 20 0 40 L0 200 Q20 220 40 220 L60 220 Q80 230 80 240 L80 260 Q60 270 40 270 L20 270 Q0 290 0 310 L0 390 Q20 410 40 410 L60 410 Q80 420 80 430 L80 440 Q60 450 40 450 L20 450 Q0 470 0 490 L100 490" fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.7}
          />
          <path d="M840 400 Q860 420 880 420 L900 420 Q920 420 940 400 L960 400 Q940 380 920 380 L900 380 Q880 380 860 390 L840 390" fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.7}
          />

          {/* Layer 3: Active Volumetric Medium (Steam Plume) */}
          <g filter="url(#steamGlow)">
            {/* Main steam flow path - simplified as expanding plume */}
            <path d="M80 40 L120 80 L360 80 L600 80 L840 80 L880 400 L600 400 L360 400 L120 400 L80 360 Z" fill="url(#steamGradient)" opacity={0.6}
            />
            {/* Intermediate pressure stages */}
            <path d="M200 100 L280 100 L280 380 L200 380 Z" fill="url(#steamGradient)" opacity={0.4}
            />
            <path d="M400 120 L480 120 L480 360 L400 360 Z" fill="url(#steamGradient)" opacity={0.3}
            />
            <path d="M560 140 L640 140 L640 340 L560 340 Z" fill="url(#steamGradient)" opacity={0.2}
            />
          </g>

          {/* Layer 4: Kinetic Actors and Particles */}
          <g>
            {/* Rotor disks with blades */}
            <g className="rotor-disks">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((diskIndex) => (
                <g
                  key={diskIndex}
                  className="rotor-disk"
                  transform={`translate(${480 + (diskIndex - 3.5) * 20}, ${240})`}
                >
                  {/* Disk body */}
                  <circle cx={0} cy={0} r={20} fill="none" stroke="#64748b" strokeWidth={1}
                  />
                  {/* Blades */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((bladeIndex) => (
                    <line key={bladeIndex} x1={0} y1={0} x2={0} y2={-30} stroke="#94a3b8" strokeWidth={2} transform={`rotate(${
                        bladeAngles[diskIndex * 12 + bladeIndex] * (180 / Math.PI)
                      })`}
                    />
                  ))}
                </g>
              ))}
            </g>

            {/* Steam particles tracing pathlines */}
            <g className="steam-particles">
              {particlePaths.map((p, index) => (
                <circle key={index} className="steam-particle" r={3} fill="#38bdf8" opacity={0.8}
                />
              ))}
            </g>
          </g>

          {/* Layer 5: In-situ HUD Instrumentation Callouts */}
          <g className="text-gray-300" fontSize="10">
            {/* Throttle badge */}
            <g id="throttle-badge" transform="translate(150, 80)">
              <rect x={0} y={0} width={60} height={20} rx={3} fill="gray-800/50" />
              <text x={5} y={12}>Throttle</text>
              <text x={5} y={22} className="font-medium">
                {(throttleValveOpening * 100).toFixed(0)}%
              </text>
            </g>

            {/* Governor badge */}
            <g id="governor-badge" transform="translate(150, 120)">
              <rect x={0} y={0} width={60} height={20} rx={3} fill="gray-800/50" />
              <text x={5} y={12}>Governor</text>
              <text x={5} y={22} className="font-medium">
                {governorSleevePosition.toFixed(1)} mm
              </text>
            </g>

            {/* Power badge */}
            <g id="power-badge" transform="translate(150, 160)">
              <rect x={0} y={0} width={60} height={20} rx={3} fill="gray-800/50" />
              <text x={5} y={12}>Power Output</text>
              <text x={5} y={22} className="font-medium">
                {mechanicalPowerOutput.toFixed(1)} MW
              </text>
            </g>

            {/* Speed badge */}
            <g id="speed-badge" transform="translate(150, 200)">
              <rect x={0} y={0} width={60} height={20} rx={3} fill="gray-800/50" />
              <text x={5} y={12}>RPM</text>
              <text x={5} y={22} className="font-medium">
                {rotationalSpeed.toFixed(0)} rpm
              </text>
            </g>

            {/* Efficiency badge */}
            <g id="efficiency-badge" transform="translate(150, 240)">
              <rect x={0} y={0} width={60} height={20} rx={3} fill="gray-800/50" />
              <text x={5} y={12}>Stage η</text>
              <text x={5} y={22} className="font-medium">
                {(stageEfficiency * 100).toFixed(1)}%
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Interactive Control Deck */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Inlet Pressure
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={inletPressure}
                onChange={(e) => setInletPressure(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-xs text-gray-400 w-10">
                {inletPressure} MPa
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Inlet Temperature
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min={200}
                max={600}
                step={10}
                value={inletTemperature}
                onChange={(e) => setInletTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-xs text-gray-400 w-10">
                {inletTemperature} °C
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Load Torque
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={loadTorque}
                onChange={(e) => setLoadTorque(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-xs text-gray-400 w-10">
                {loadTorque} N·m
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Governor Gain
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.1}
                value={governorGain}
                onChange={(e) => setGovernorGain(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-xs text-gray-400 w-10">
                {governorGain}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Educational Theory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((step) => {
          const callout = {
            1: {
              title: "High-Pressure Steam Entry",
              text: "Superheated steam enters at high pressure and temperature, passing through throttle valve controlled by governor. Energy available for work is determined by inlet enthalpy.",
            },
            2: {
              title: "Expansion Through Turbine Stages",
              text: "Steam expands through alternating nozzle (impulse) and blade (reaction) rows, converting enthalpy drop into kinetic energy then torque on rotor blades. Pressure and temperature decrease progressively.",
            },
            3: {
              title: "Speed Governing Mechanism",
              text: "Centrifugal governor senses rotational speed; if speed increases, flyweights move outward, lifting sleeve to reduce throttle valve opening, decreasing steam flow and power to maintain constant RPM under varying load.",
            },
            4: {
              title: "Exhaust and Condensation",
              text: "Low-pressure steam exits to condenser where it is condensed to water, creating vacuum that increases enthalpy drop across turbine. Condensate is fed back to boiler to complete Rankine cycle.",
            },
          }[step];
          return (
            <div
              key={step}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
            >
              <h3 className="font-medium text-white mb-2">
                Step {step}: {callout.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {callout.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
