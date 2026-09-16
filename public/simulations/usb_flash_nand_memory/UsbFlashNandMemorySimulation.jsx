import React, { useState, useMemo, useEffect, useRef } from "react";

export default function UsbFlashNandMemorySimulation() {
  const [mode, setMode] = useState("read");
  const [controlGateVoltage, setControlGateVoltage] = useState(2.5);
  const [storedChargeLevel, setStoredChargeLevel] = useState(750);
  const [tunnelOxideThickness, setTunnelOxideThickness] = useState(8.0);
  const [temperature, setTemperature] = useState(25);

  const baseThresholdVoltage = 1.5;
  const thresholdVoltageShift = (storedChargeLevel * 1.6e-19) / 6.0e-17 * 1000;
  const effectiveVth = baseThresholdVoltage + storedChargeLevel / 300;
  const electricFieldOxide = Math.abs(controlGateVoltage) / (tunnelOxideThickness * 1e-7);
  const isTunnelingActive = Math.abs(controlGateVoltage) >= 12.0;
  const channelConducts = controlGateVoltage > effectiveVth;
  const channelCurrentUa = channelConducts
    ? Math.pow(controlGateVoltage - effectiveVth, 2) * 18.5
    : 0.0;
  const sensedBinaryBit = storedChargeLevel >= 350 ? 0 : 1;
  const chargeRetentionYears =
    storedChargeLevel > 0
      ? (10.0 * Math.exp(0.4 * (1 - (temperature - 25) / 100))).toFixed(1)
      : "N/A";

  const svgRef = useRef(null);
  const gsapContextRef = useRef(null);

  const handleModeSelect = (newMode) => {
    setMode(newMode);
    if (newMode === "read") {
      setControlGateVoltage(2.5);
    } else if (newMode === "program") {
      setControlGateVoltage(18.0);
      setStoredChargeLevel(850);
    } else if (newMode === "erase") {
      setControlGateVoltage(-20.0);
      setStoredChargeLevel(50);
    }
  };

  useEffect(() => {
    const ctx = (gsapContextRef.current = gsap.context(() => {
      if (isTunnelingActive) {
        const direction = controlGateVoltage > 0 ? -1 : 1;
        gsap.fromTo(
          ".tunnel-electron",
          { y: 0, opacity: 0.3 },
          {
            y: direction * 20,
            opacity: 1,
            duration: 0.7,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            stagger: 0.08,
          }
        );
      }

      if (channelConducts) {
        gsap.fromTo(
          ".channel-electron",
          { x: 0, opacity: 0.3 },
          {
            x: 500,
            opacity: 1,
            duration: 1.2,
            repeat: -1,
            ease: "none",
            stagger: 0.15,
          }
        );
      }

      const glowIntensity = storedChargeLevel / 1200;
      gsap.to(".floating-gate-glow", {
        attr: { floodOpacity: 0.2 + glowIntensity * 0.6 },
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, svgRef));

    return () => ctx.revert();
  }, [
    mode,
    controlGateVoltage,
    storedChargeLevel,
    tunnelOxideThickness,
    isTunnelingActive,
    channelConducts,
  ]);

  const telemetryMetrics = useMemo(
    () => [
      {
        label: "Sensed Binary Bit",
        value: sensedBinaryBit === 0 ? "0 (Programmed)" : "1 (Erased)",
        unit: "Logic State",
        description:
          "State '0' corresponds to trapped electrons shielding the gate; '1' corresponds to empty floating gate.",
      },
      {
        label: "Threshold Voltage (Vth)",
        value: effectiveVth.toFixed(2),
        unit: "V",
        description:
          "Minimum gate voltage required to invert channel. Trapped electrons shift Vth from ~1.5V up to ~5.5V.",
      },
      {
        label: "Channel Conduction",
        value: channelConducts ? "CONDUCTING (Current Detected)" : "PINCHED-OFF (No Current)",
        unit: "State",
        description:
          "Sense amplifier at Bit Line measures whether current flows to determine 1 vs 0.",
      },
      {
        label: "Source-Drain Current (Ids)",
        value: channelCurrentUa.toFixed(1),
        unit: "µA",
        description:
          "Conduction current detected by the USB drive's sense amplifier.",
      },
      {
        label: "Oxide Electric Field (E_ox)",
        value: electricFieldOxide.toFixed(2),
        unit: "MV/cm",
        description:
          "Fields exceeding ~10 MV/cm trigger Fowler-Nordheim quantum tunneling through the energy barrier.",
      },
      {
        label: "Estimated Data Retention",
        value: chargeRetentionYears,
        unit: "Years",
        description:
          "Isolated by high-energy SiO2 barriers (3.1 eV), trapped electrons remain stable for decades without power.",
      },
    ],
    [
      sensedBinaryBit,
      effectiveVth,
      channelConducts,
      channelCurrentUa,
      electricFieldOxide,
      chargeRetentionYears,
    ]
  );

  const educationalCallouts = useMemo(
    () => [
      {
        title: "Why It Never Forgets (Non-Volatile)",
        text:
          "Unlike RAM which needs continuous electricity to refresh capacitor charge, the Floating Gate is completely surrounded by glass-like silicon dioxide insulators. The 3.1 eV energy barrier is so high that trapped electrons cannot escape at room temperature for over 10 to 50 years.",
      },
      {
        title: "Quantum Tunneling vs Classical Physics",
        text:
          "Classically, electrons cannot climb over the 3.1 eV SiO2 barrier with normal thermal energy. Under high voltage (18V), the oxide band tilts so sharply that the barrier thickness narrows to a few nanometers. Electrons exploit quantum mechanical wave-particle duality to tunnel directly through the barrier into the floating gate.",
      },
      {
        title: "How a Pendrive Reads a Bit",
        text:
          "The USB memory controller applies a gentle read voltage of +2.5V to the control gate. If electrons are trapped (Bit 0), their negative charge repels electrons in the silicon below, preventing a channel and yielding 0 µA current. If the gate is empty (Bit 1), the +2.5V attracts electrons, turning the transistor ON and conducting current.",
      },
    ],
    []
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-900 text-white font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">
          NAND Flash Memory: Floating-Gate Quantum Tunneling & Physical Bit Storage in USB Drives
        </h1>
        <p className="text-gray-400 mt-2">
          Solid-State Quantum Electronics & Non-Volatile Memory Physics
        </p>
        <div className="mt-4 px-4 py-2 rounded-full bg-gray-800/50 inline-flex items-center gap-2">
          <span className="font-medium">Mode:</span>
          <span
            className={`px-3 py-1 rounded-full ${
              mode === "read"
                ? "bg-blue-600/20 text-blue-300"
                : mode === "program"
                ? "bg-amber-600/20 text-amber-300"
                : "bg-red-600/20 text-red-300"
            }`}
          >
            {mode.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
        {telemetryMetrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <h3 className="font-semibold text-gray-300 mb-2">{metric.label}</h3>
            <div className="text-2xl font-mono">{metric.value}</div>
            <p className="text-xs text-gray-400 mt-1">{metric.unit}</p>
            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </div>
        ))}
      </div>

      <div className="relative h-[500px] w-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700/50">
        <svg
          ref={svgRef}
          viewBox="0 0 920 400"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="gateGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
            <filter id="tunnelGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="channelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Control Gate */}
          <rect x="360" y="40" width="200" height="35" fill="#6366f1" rx="4"
          />
          <text
            x="460"
            y="35"
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            Control Gate (Word Line Vcg)
          </text>

          {/* Inter-Poly Dielectric */}
          <rect x="360" y="75" width="200" height="25" fill="#334155"
          />
          <text
            x="460"
            y="95"
            textAnchor="middle"
            fill="white"
            fontSize="9"
          >
            Inter-Poly Dielectric (IPD Blocking Oxide)
          </text>

          {/* Floating Gate */}
          <g className="floating-gate">
            <rect x="360" y="100" width="200" height="45" fill="#f59e0b" rx="3"
            />
            <text
              x="460"
              y="90"
              textAnchor="middle"
              fill="white"
              fontSize="9"
            >
              Isolated Floating Gate (Traps Electrons)
            </text>
            {/* Trapped Electrons Cloud */}
            {Array.from({ length: Math.ceil(storedChargeLevel / 50) }).map(
              (_, i) => (
                <circle key={`electron-${i}`} className="trapped-electron" cx={400 + (i % 4) * 25} cy={122 + Math.floor(i / 4) * 12} r="2" fill="#fbbf24"
                />
              )
            )}
            {/* Glow Effect */}
            <rect x="360" y="100" width="200" height="45" fill="url(#gateGlow)" className="floating-gate-glow"
            />
          </g>

          {/* Tunnel Oxide Barrier */}
          <rect x="360" y="145" width="200" height={22} fill="rgba(56, 189, 248, 0.3)"
          />
          <text
            x="460"
            y="170"
            textAnchor="middle"
            fill="white"
            fontSize="9"
          >
            Tunnel Oxide Barrier (8nm SiO2)
          </text>

          {/* Silicon Channel */}
          <rect x="360" y="167" width="200" height="30" fill="#0f172a"
          />
          <text
            x="460"
            y="195"
            textAnchor="middle"
            fill="white"
            fontSize="9"
          >
            Inversion Channel Region
          </text>

          {/* Source */}
          <rect x="120" y="170" width="140" height="60" fill="url(#channelGrad)"
          />
          <text
            x="190"
            y="200"
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            Source (N+)
          </text>

          {/* Drain */}
          <rect x="660" y="170" width="140" height="60" fill="url(#channelGrad)"
          />
          <text
            x="730"
            y="200"
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            Drain (Bit Line N+)
          </text>

          {/* P-Substrate */}
          <rect x="0" y="230" width="920" height="130" fill="#1e293b"
          />
          <text
            x="460"
            y="300"
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            P-type Silicon Substrate
          </text>

          {/* Tunneling Electrons */}
          {isTunnelingActive && (
            <g className="tunneling-stream">
              {Array.from({ length: 8 }).map((_, i) => (
                <circle key={`tunnel-${i}`} className="tunnel-electron" cx={460 + (i - 3.5) * 8} cy={156} r="1.5" fill="#a855f7"
                />
              ))}
            </g>
          )}

          {/* Channel Conduction Electrons */}
          {channelConducts && (
            <g className="channel-flow">
              {Array.from({ length: 6 }).map((_, i) => (
                <circle key={`channel-${i}`} className="channel-electron" cx={120 + i * 30} cy={182} r="1.5" fill="#34d399"
                />
              ))}
            </g>
          )}

          {/* Electric Field Vectors (when tunneling active) */}
          {isTunnelingActive && (
            <g className="field-vectors">
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={`field-${i}`} x1={360 + i * 40} y1={145} x2={360 + i * 40} y2={167} stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowhead)"
                />
              ))}
            </g>
          )}

          {/* Arrowhead definition */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2">
              <path d="M0,0 L0,4 L6,2 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Energy Band Diagram (side inset) */}
          <g transform="translate(750, 50) scale(0.8)">
            <rect x="0" y="0" width="120" height="100" fill="#0f172a" />
            <text x="60" y="-10" textAnchor="middle" fill="white" fontSize="9">
              Energy Band Diagram
            </text>
            {/* Conduction Band */}
            <line x1="10" y1="20" x2="110" y2="20" stroke="#34d399" strokeWidth="2"
            />
            {/* Fermi Level */}
            <line x1="10" y1="50" x2="110" y2="50" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2,2"
            />
            {/* Valence Band */}
            <line x1="10" y1="80" x2="110" y2="80" stroke="#10b981" strokeWidth="2"
            />
            {/* Barrier Tilt (when high field) */}
            {electricFieldOxide > 10 && (
              <polygon points="30,20 90,20 110,50 30,80" fill="rgba(168, 85, 247, 0.2)"
              />
            )}
            <text x="60" y="15" fill="#34d399" fontSize="8">
              E_C
            </text>
            <text x="60" y="45" fill="#fbbf24" fontSize="8">
              E_F
            </text>
            <text x="60" y="75" fill="#10b981" fontSize="8">
              E_V
            </text>
          </g>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Flash Operation Mode</h3>
          <div className="flex gap-3">
            {["read", "program", "erase"].map((m) => (
              <button
                key={m}
                onClick={() => handleModeSelect(m)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                  mode === m
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                    : "bg-gray-800/40 border-gray-700/60 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                {m === "read"
                  ? "1. READ Cell (Vcg = +2.5V)"
                  : m === "program"
                  ? "2. PROGRAM (Write '0', +18V Tunneling)"
                  : "3. ERASE (Reset '1', -20V Tunneling)"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Control Gate Voltage (Vcg)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="-20"
                max="20"
                step="0.5"
                value={controlGateVoltage}
                onChange={(e) => setControlGateVoltage(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded"
              />
              <span className="ml-3 w-16 text-right text-xs font-mono">
                {controlGateVoltage}V
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Trapped Electrons (Floating Gate Charge)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="1200"
                step="50"
                value={storedChargeLevel}
                onChange={(e) => setStoredChargeLevel(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded"
              />
              <span className="ml-3 w-16 text-right text-xs font-mono">
                {storedChargeLevel}e-
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tunnel Oxide Thickness (d_ox)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="6"
                max="12"
                step="0.5"
                value={tunnelOxideThickness}
                onChange={(e) =>
                  setTunnelOxideThickness(parseFloat(e.target.value))
                }
                className="flex-1 h-2 bg-gray-700 rounded"
              />
              <span className="ml-3 w-16 text-right text-xs font-mono">
                {tunnelOxideThickness}nm
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Operating Temperature
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="-20"
                max="85"
                step="5"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded"
              />
              <span className="ml-3 w-16 text-right text-xs font-mono">
                {temperature}°C
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {educationalCallouts.map((callout, index) => (
          <div
            key={index}
            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
          >
            <h4 className="font-semibold mb-2">{callout.title}</h4>
            <p className="text-gray-300 text-sm">{callout.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
