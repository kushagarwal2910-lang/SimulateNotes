import React, { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PhotoelectricEffectSimulation() {
  const [wavelength, setWavelength] = useState(400);
  const [intensity, setIntensity] = useState(50);
  const [workFunction, setWorkFunction] = useState(2.3);
  const [isPlaying, setIsPlaying] = useState(true);
  const photonRefs = useRef([]);
  const electronRefs = useRef([]);
  const gsapContextRef = useRef();

  const planckConstant = 4.135667662e-15;
  const speedOfLight = 299792458;
  const electronCharge = 1.602176634e-19;

  const photonEnergy_eV = useMemo(() => (planckConstant * speedOfLight * 1e9) / wavelength, [wavelength]);
  const thresholdWavelength_nm = useMemo(() => (planckConstant * speedOfLight * 1e9) / workFunction, [workFunction]);
  const maxKineticEnergy_eV = useMemo(() => Math.max(0, photonEnergy_eV - workFunction), [photonEnergy_eV, workFunction]);
  const photoelectronRate = useMemo(() => intensity * (photonEnergy_eV > workFunction ? 1 : 0), [intensity, photonEnergy_eV, workFunction]);
  const stoppingPotential_V = maxKineticEnergy_eV;

  const photonCount = 15;
  const maxElectronCount = 15;
  const electronCount = Math.min(maxElectronCount, Math.floor(photoelectronRate / 2));

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!isPlaying) return;
      photonRefs.current.forEach((ref, i) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          x: 760,
          duration: 3,
          repeat: -1,
          ease: "none",
          delay: i * 0.2
        });
      });
      electronRefs.current.forEach((ref, i) => {
        if (!ref.current || i >= electronCount) return;
        const speed = Math.sqrt(maxKineticEnergy_eV) * 20 + 50;
        gsap.to(ref.current, {
          x: 760,
          y: 240,
          duration: Math.max(0.1, 600 / speed),
          repeat: -1,
          ease: "none",
          delay: i * 0.1
        });
      });
    }, gsapContextRef.current);
    return () => ctx.revert();
  }, [isPlaying, electronCount, maxKineticEnergy_eV]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setWavelength(400);
    setIntensity(50);
    setWorkFunction(2.3);
    setIsPlaying(true);
  };

  const hexPattern = Array.from({ length: 20 }, (_, i) => {
    const x = i * 48;
    const yOffset = (i % 2) * 24;
    return (
      <path key={i} d={`M${x},${20 + yOffset} h24 l12,20 h-12 l-12,-20 Z`} fill="none" stroke="#1e293b" strokeWidth={0.5} opacity={0.3}
      />
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Interactive Photoelectric Effect</h1>
        <p className="text-sm text-gray-400">Explore photon energy, work function, and electron emission</p>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          photonEnergy_eV > workFunction
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }`}>
          {photonEnergy_eV > workFunction ? "EMISSION ACTIVE" : "BELOW THRESHOLD"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
        {[{
          label: "Photon Energy",
          value: photonEnergy_eV.toFixed(2),
          unit: "eV"
        }, {
          label: "Max Kinetic Energy",
          value: maxKineticEnergy_eV.toFixed(2),
          unit: "eV"
        }, {
          label: "Stopping Potential",
          value: stoppingPotential_V.toFixed(2),
          unit: "V"
        }, {
          label: "Photoelectron Rate",
          value: photoelectronRate.toFixed(1),
          unit: "arb. units/s"
        }, {
          label: "Threshold Wavelength",
          value: thresholdWavelength_nm.toFixed(0),
          unit: "nm"
        }, {
          label: "Emission Status",
          value: photonEnergy_eV > workFunction ? "YES" : "NO",
          unit: ""
        }].map((metric, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
            <div className="text-gray-400">{metric.label}</div>
            <div className="flex items-baseline mt-1">
              <span className="text-lg font-semibold text-white">{metric.value}</span>
              <span className="ml-2 text-xs text-gray-400">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative w-full h-[500px] bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
        <svg className="w-full h-full" viewBox="0 0 960 480">
          <defs>
            <linearGradient id="photonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <radialGradient id="electronGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </radialGradient>
            <filter id="emissionGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Layer 1: Environment Grid */}
          <g>{hexPattern}</g>

          {/* Layer 2: Primary Enclosure */}
          <path d="M 100 120 C 100 80, 200 80, 200 120 L 760 120 C 760 80, 860 80, 860 120 L 860 360 C 860 400, 760 400, 760 360 L 200 360 C 200 400, 100 400, 100 360 Z" fill="none" stroke="#374151" strokeWidth={2}
          />
          <rect x="80" y="100" width="20" height="260" fill="#6b7280" />
          <rect x="860" y="100" width="20" height="260" fill="#6b7280" />

          {/* Layer 3: Active Volumetric Medium */}
          <rect x="100" y="120" width="660" height="240" fill="url(#photonGradient)" opacity={intensity / 100} />
          {electronCount > 0 && (
            <circle cx="180" cy="240" r={20 + electronCount * 2} fill="url(#electronGradient)" filter="url(#emissionGlow)" />
          )}

          {/* Layer 4: Kinetic Actors & Particles */}
          <g>
            {Array.from({ length: photonCount }).map((_, i) => (
              <circle
                key={i}
                ref={(el) => (photonRefs.current[i] = el)}
                cx={100 + i * 20}
                cy={240}
                r={4}
                fill="#38bdf8"
              />
            ))}
            {Array.from({ length: maxElectronCount }).map((_, i) => (
              <circle
                key={i}
                ref={(el) => (electronRefs.current[i] = el)}
                cx={100}
                cy={240}
                r={3}
                fill={i < electronCount ? "#f43f5e" : "none"}
              />
            ))}
          </g>

          {/* Layer 5: In-situ HUD */}
          <text x="120" y="100" fill="#38bdf8" fontSize="12" fontWeight="bold">
            E={photonEnergy_eV.toFixed(1)} eV
          </text>
          <text x="90" y="240" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="end">
            φ={workFunction} eV
          </text>
          <text x="480" y="140" fill="#facc15" fontSize="12" fontWeight="bold">
            V_s={stoppingPotential_V.toFixed(1)} V
          </text>
          <text x="780" y="240" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="end">
            K.E.={maxKineticEnergy_eV.toFixed(1)} eV
          </text>
          <text x="480" y="440" fill="#a78bfa" fontSize="10" textAnchor="middle">
            λ₀={thresholdWavelength_nm.toFixed(0)} nm
          </text>
          <line x1="480" y1="420" x2="480" y2="460" stroke="#a78bfa" strokeWidth={1} />
        </svg>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Wavelength (nm)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={200}
              max={700}
              step={1}
              value={wavelength}
              onChange={(e) => setWavelength(Number(e.target.value))}
              className="flex-1 h-1 bg-gray-700 rounded-lg"
            />
            <span className="w-16 text-right text-xs text-gray-400">{wavelength}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Intensity
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="flex-1 h-1 bg-gray-700 rounded-lg"
            />
            <span className="w-16 text-right text-xs text-gray-400">{intensity}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Work Function (eV)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={workFunction * 10}
              onChange={(e) => setWorkFunction(Number(e.target.value) / 10)}
              className="flex-1 h-1 bg-gray-700 rounded-lg"
            />
            <span className="w-16 text-right text-xs text-gray-400">{workFunction.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-sm font-medium text-gray-200 rounded-lg border border-gray-700"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-sm font-medium text-gray-200 rounded-lg border border-gray-700"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-400">
        {[{
          title: "Photon Absorption",
          text: "Incoming photons strike the metal surface. Only photons with energy exceeding the work function (E_photon > φ) can eject electrons."
        }, {
          title: "Electron Emission & Kinetic Energy",
          text: "Ejected electrons gain kinetic energy equal to the excess photon energy: K.E. = hν - φ. This kinetic energy determines their speed toward the anode."
        }, {
          title: "Intensity vs. Frequency Effects",
          text: "Increasing light intensity increases the NUMBER of emitted electrons (brightness of beam) but does NOT change their kinetic energy. Increasing frequency (decreasing wavelength) increases the ENERGY of each emitted electron."
        }, {
          title: "Threshold Frequency Concept",
          text: "Below a critical threshold frequency (or above threshold wavelength), no electrons are emitted regardless of light intensity. This demonstrates the particle nature of light and contradicts classical wave theory predictions."
        }].map((card, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
            <div className="font-medium mb-1">{card.title}</div>
            <div>{card.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
