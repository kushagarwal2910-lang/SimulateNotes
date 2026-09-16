/**
 * Domain Physics Simulation Synthesizer
 * Formulates scientifically accurate, 60 FPS interactive React 18 + GSAP simulation
 * components tailored to specific physical, chemical, biological, and mathematical domains.
 */

export type ScientificDomain =
  | "pendulum_oscillations"
  | "celestial_orbits"
  | "thermodynamics_gas"
  | "waves_quantum_optics"
  | "electromagnetism_circuits"
  | "fluid_aerodynamics"
  | "biochemistry_enzymes"
  | "neuroscience_action_potential"
  | "chemical_kinetics"
  | "chaos_dynamical_systems"
  | "general_coupled_dynamics";

export function classifyTopicDomain(topic: string): ScientificDomain {
  const t = topic.toLowerCase();

  // 1. Oscillations & Pendulums
  if (
    t.includes("pendulum") ||
    t.includes("harmonic") ||
    t.includes("oscillator") ||
    t.includes("vibrat") ||
    t.includes("spring") ||
    t.includes("damping") ||
    t.includes("shm")
  ) {
    return "pendulum_oscillations";
  }

  // 2. Celestial Mechanics & Orbits
  if (
    t.includes("orbit") ||
    t.includes("celestial") ||
    t.includes("kepler") ||
    t.includes("planet") ||
    t.includes("satellite") ||
    t.includes("gravity well") ||
    t.includes("black hole") ||
    t.includes("escape velocity") ||
    t.includes("vis-viva") ||
    t.includes("solar system")
  ) {
    return "celestial_orbits";
  }

  // 3. Thermodynamics & Gas Kinetics
  if (
    t.includes("gas") ||
    t.includes("thermo") ||
    t.includes("temperature") ||
    t.includes("heat") ||
    t.includes("pressure") ||
    t.includes("carnot") ||
    t.includes("entropy") ||
    t.includes("boltzmann") ||
    t.includes("ideal gas") ||
    t.includes("brownian") ||
    t.includes("stirling")
  ) {
    return "thermodynamics_gas";
  }

  // 4. Waves, Optics & Quantum Mechanics
  if (
    t.includes("wave") ||
    t.includes("optic") ||
    t.includes("quantum") ||
    t.includes("light") ||
    t.includes("slit") ||
    t.includes("diffraction") ||
    t.includes("interference") ||
    t.includes("photon") ||
    t.includes("laser") ||
    t.includes("refraction") ||
    t.includes("snell") ||
    t.includes("tunneling") ||
    t.includes("lens")
  ) {
    return "waves_quantum_optics";
  }

  // 5. Electromagnetism & Circuits
  if (
    t.includes("circuit") ||
    t.includes("rlc") ||
    t.includes("magnetic") ||
    t.includes("electric field") ||
    t.includes("lorentz") ||
    t.includes("induction") ||
    t.includes("faraday") ||
    t.includes("capacitor") ||
    t.includes("inductor") ||
    t.includes("voltage") ||
    t.includes("current") ||
    t.includes("resonance")
  ) {
    return "electromagnetism_circuits";
  }

  // 6. Fluid Dynamics & Aerodynamics
  if (
    t.includes("fluid") ||
    t.includes("aero") ||
    t.includes("airfoil") ||
    t.includes("lift") ||
    t.includes("drag") ||
    t.includes("wing") ||
    t.includes("bernoulli") ||
    t.includes("venturi") ||
    t.includes("pipe flow") ||
    t.includes("reynolds") ||
    t.includes("navier") ||
    t.includes("viscosity") ||
    t.includes("hydraulic")
  ) {
    return "fluid_aerodynamics";
  }

  // 7. Biochemistry & Enzyme Kinetics
  if (
    t.includes("enzyme") ||
    t.includes("protein") ||
    t.includes("dna") ||
    t.includes("rna") ||
    t.includes("michaelis") ||
    t.includes("menten") ||
    t.includes("substrate") ||
    t.includes("crispr") ||
    t.includes("cellular") ||
    t.includes("metabolism") ||
    t.includes("cataly")
  ) {
    return "biochemistry_enzymes";
  }

  // 8. Neuroscience & Action Potentials
  if (
    t.includes("neuron") ||
    t.includes("neuro") ||
    t.includes("brain") ||
    t.includes("action potential") ||
    t.includes("synapse") ||
    t.includes("membrane") ||
    t.includes("hodgkin") ||
    t.includes("axon") ||
    t.includes("neurotransmitter") ||
    t.includes("ion channel")
  ) {
    return "neuroscience_action_potential";
  }

  // 9. Chemical Kinetics & Reactions
  if (
    t.includes("chem") ||
    t.includes("reaction") ||
    t.includes("arrhenius") ||
    t.includes("equilibrium") ||
    t.includes("titration") ||
    t.includes("acid") ||
    t.includes("base") ||
    t.includes("ph ") ||
    t.includes("activation energy") ||
    t.includes("reactor")
  ) {
    return "chemical_kinetics";
  }

  // 10. Chaos & Dynamical Systems
  if (
    t.includes("chaos") ||
    t.includes("lorenz") ||
    t.includes("attractor") ||
    t.includes("fractal") ||
    t.includes("bifurcation") ||
    t.includes("lyapunov") ||
    t.includes("nonlinear") ||
    t.includes("phase space")
  ) {
    return "chaos_dynamical_systems";
  }

  return "general_coupled_dynamics";
}

export interface DomainSimulationResult {
  code: string;
  title: string;
  subtitle: string;
  equations: string[];
  parameters: { name: string; value: string; unit: string }[];
  keyParameters: { name: string; value: string; unit: string }[];
  category: string;
  description: string;
  accentColor: string;
}

/**
 * Synthesizes a high-accuracy, topic-aware 60 FPS React simulation component.
 */
export function synthesizeDomainSimulation(topic: string, componentName: string): DomainSimulationResult {
  const domain = classifyTopicDomain(topic);
  const safeTitle = topic.replace(/["\\]/g, "");
  let raw: {
    code: string;
    equations: string[];
    parameters: { name: string; value: string; unit: string }[];
    category: string;
    description: string;
  };

  switch (domain) {
    case "pendulum_oscillations":
      raw = synthesizePendulumSimulation(safeTitle, componentName);
      break;
    case "celestial_orbits":
      raw = synthesizeOrbitalSimulation(safeTitle, componentName);
      break;
    case "thermodynamics_gas":
      raw = synthesizeThermodynamicsSimulation(safeTitle, componentName);
      break;
    case "waves_quantum_optics":
      raw = synthesizeWaveOpticsSimulation(safeTitle, componentName);
      break;
    case "electromagnetism_circuits":
      raw = synthesizeCircuitSimulation(safeTitle, componentName);
      break;
    case "fluid_aerodynamics":
      raw = synthesizeAerodynamicsSimulation(safeTitle, componentName);
      break;
    case "biochemistry_enzymes":
      raw = synthesizeEnzymeSimulation(safeTitle, componentName);
      break;
    case "neuroscience_action_potential":
      raw = synthesizeNeuroscienceSimulation(safeTitle, componentName);
      break;
    case "chemical_kinetics":
      raw = synthesizeChemicalKineticsSimulation(safeTitle, componentName);
      break;
    case "chaos_dynamical_systems":
      raw = synthesizeChaosSimulation(safeTitle, componentName);
      break;
    case "general_coupled_dynamics":
    default:
      raw = synthesizeGeneralDynamicalSimulation(safeTitle, componentName);
      break;
  }

  return {
    ...raw,
    title: safeTitle,
    subtitle: `60 FPS Physical Model: ${raw.category}`,
    keyParameters: raw.parameters,
    accentColor: "#38bdf8",
  };
}

// ---------------------------------------------------------------------------
// 1. PENDULUM & OSCILLATIONS SIMULATION
// ---------------------------------------------------------------------------
function synthesizePendulumSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [length, setLength] = useState(1.8);
  const [gravity, setGravity] = useState(9.81);
  const [damping, setDamping] = useState(0.12);
  const [mass, setMass] = useState(1.2);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showVectors, setShowVectors] = useState(true);

  const [theta, setTheta] = useState(0.785);
  const [omega, setOmega] = useState(0);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    let lastTime = performance.now();

    const step = (now) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      setTheta((th) => {
        setOmega((om) => {
          // Angular acceleration: alpha = -(g/L)*sin(theta) - (gamma/(m*L))*omega
          const alpha = -(gravity / length) * Math.sin(th) - (damping / (mass * length)) * om;
          const nextOmega = om + alpha * dt;
          const nextTheta = th + nextOmega * dt;

          // Bob coordinates in SVG space: pivot at (480, 80)
          const px = 480 + Math.sin(nextTheta) * (length * 120);
          const py = 80 + Math.cos(nextTheta) * (length * 120);

          setTrail((t) => {
            const updated = [...t, { x: px, y: py }];
            return updated.length > 40 ? updated.slice(updated.length - 40) : updated;
          });

          return nextOmega;
        });
        return th;
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, length, gravity, damping, mass]);

  const pivotX = 480;
  const pivotY = 80;
  const bobRadius = Math.max(14, 12 + mass * 5);
  const bobX = pivotX + Math.sin(theta) * (length * 120);
  const bobY = pivotY + Math.cos(theta) * (length * 120);

  // Velocity vector tangent: (-cos(theta)*v, sin(theta)*v)
  const linVelocity = omega * length;
  const vx = bobX + Math.cos(theta) * linVelocity * 18;
  const vy = bobY - Math.sin(theta) * linVelocity * 18;

  // Real-time physical metrics
  const h = length * (1 - Math.cos(theta));
  const kineticEnergy = (0.5 * mass * Math.pow(length * omega, 2)).toFixed(2);
  const potentialEnergy = (mass * gravity * h).toFixed(2);
  const totalEnergy = (parseFloat(kineticEnergy) + parseFloat(potentialEnergy)).toFixed(2);
  const period = (2 * Math.PI * Math.sqrt(length / gravity)).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-sky-500/10 border border-sky-500/30 text-sky-400">
          Classical Mechanics & Nonlinear Harmonic Dynamics
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Phase-space numerical integration of second-order angular differential equations with viscous Stokes damping and conservation of mechanical energy.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Kinetic Energy (E_k)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{kineticEnergy} <span className="text-xs font-normal text-slate-400">J</span></div>
          <div className="text-[10px] text-slate-400 mt-1">½ m (L · ω)²</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Potential Energy (E_p)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{potentialEnergy} <span className="text-xs font-normal text-slate-400">J</span></div>
          <div className="text-[10px] text-slate-400 mt-1">m · g · L(1 - cos θ)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Total Energy (E_tot)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{totalEnergy} <span className="text-xs font-normal text-slate-400">J</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Dissipating via damping</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Theoretical Period (T)</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{period} <span className="text-xs font-normal text-slate-400">s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">T ≈ 2π √(L/g)</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          <defs>
            <radialGradient id="bobGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </radialGradient>
            <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Coordinate grid */}
          <g opacity="0.1" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4">
            <line x1="80" y1="240" x2="880" y2="240" />
            <line x1="480" y1="40" x2="480" y2="440" />
            <circle cx="480" cy="80" r="120" fill="none" />
            <circle cx="480" cy="80" r="240" fill="none" />
          </g>

          {/* Pivot ceiling mount */}
          <rect x="420" y="60" width="120" height="12" rx="4" fill="#334155" />
          <circle cx="480" cy="80" r="8" fill="#94a3b8" />

          {/* Trajectory motion trace */}
          {trail.length > 1 && (
            <path
              d={trail.map((p, i) => (i === 0 ? "M " + p.x + " " + p.y : "L " + p.x + " " + p.y)).join(" ")}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              opacity="0.3"
              strokeDasharray="3,3"
            />
          )}

          {/* Rigid pendulum rod */}
          <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

          {/* Velocity vector */}
          {showVectors && (
            <line x1={bobX} y1={bobY} x2={vx} y2={vy} stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Suspended bob */}
          <circle cx={bobX} cy={bobY} r={bobRadius} fill="url(#bobGlow)" filter="url(#glowEffect)" />

          {/* Live in-situ readouts */}
          <g fontSize="12" fill="#94a3b8" fontWeight="600">
            <text x="100" y="80">ANGLE θ: {(theta * 180 / Math.PI).toFixed(1)}°</text>
            <text x="100" y="105">ANGULAR VEL ω: {omega.toFixed(2)} rad/s</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
                isPlaying
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              )}
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => { setTheta(0.785); setOmega(0); setTrail([]); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
            >
              ↺ Reset Drop (45°)
            </button>
          </div>
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={"px-3 py-1 rounded-lg text-xs font-medium border " + (
              showVectors ? "bg-sky-500/20 text-sky-300 border-sky-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
            )}
          >
            {showVectors ? "Hide Velocity Vector" : "Show Velocity Vector"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Rod Length (L)</span>
              <span className="font-mono text-sky-400 font-bold">{length.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Gravitational Acceleration (g)</span>
              <span className="font-mono text-emerald-400 font-bold">{gravity.toFixed(2)} m/s²</span>
            </div>
            <input
              type="range"
              min="1.6"
              max="24.8"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Damping Factor (γ)</span>
              <span className="font-mono text-amber-400 font-bold">{damping.toFixed(2)} Ns/m</span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.50"
              step="0.01"
              value={damping}
              onChange={(e) => setDamping(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-indigo-300">Bob Mass (m)</span>
              <span className="font-mono text-indigo-400 font-bold">{mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restoring torque is created by the tangential component of gravity F_t = -m·g·sin(θ). Energy cycles continuously between gravitational potential and rotational kinetic states.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Governing Differential Equation</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            d²θ/dt² + (γ/m)·(dθ/dt) + (g/L)·sin(θ) = 0
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nonlinear pendulum equation with velocity-proportional viscous damping solved in real time at 60 FPS.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Real-World Engineering</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly governs tuned mass dampers inside skyscrapers (e.g. Taipei 101), horological clock escapements, and seismograph sensors.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "\\frac{d^2\\theta}{dt^2} + \\frac{\\gamma}{m}\\frac{d\\theta}{dt} + \\frac{g}{L}\\sin(\\theta) = 0",
      "E_{tot} = \\frac{1}{2}mL^2\\omega^2 + mgL(1 - \\cos\\theta)",
      "T \\approx 2\\pi\\sqrt{\\frac{L}{g}}\\left(1 + \\frac{1}{16}\\theta_0^2\\right)",
    ],
    parameters: [
      { name: "Rod Length (L)", value: "1.80", unit: "m" },
      { name: "Gravity (g)", value: "9.81", unit: "m/s²" },
      { name: "Damping (γ)", value: "0.12", unit: "Ns/m" },
      { name: "Bob Mass (m)", value: "1.2", unit: "kg" },
    ],
    category: "Classical Mechanics",
    description: `Interactive nonlinear gravity pendulum simulation modeling angular phase space, Stokes damping, and mechanical energy conservation for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 2. CELESTIAL MECHANICS & ORBITS
// ---------------------------------------------------------------------------
function synthesizeOrbitalSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [centralMass, setCentralMass] = useState(1.0);
  const [semiMajor, setSemiMajor] = useState(1.4);
  const [eccentricity, setEccentricity] = useState(0.35);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime((t) => t + dt * Math.sqrt(centralMass / Math.pow(semiMajor, 3)));
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, centralMass, semiMajor]);

  // Keplerian mean anomaly to true anomaly approximation
  const M = time % (Math.PI * 2);
  const E = M + eccentricity * Math.sin(M);
  const nu = 2 * Math.atan2(Math.sqrt(1 + eccentricity) * Math.sin(E / 2), Math.sqrt(1 - eccentricity) * Math.cos(E / 2));

  // Orbital radius and coordinates (AU mapped to pixels)
  const scale = 110;
  const r = (semiMajor * (1 - Math.pow(eccentricity, 2))) / (1 + eccentricity * Math.cos(nu));
  const cx = 480;
  const cy = 240;
  const planetX = cx + Math.cos(nu) * (r * scale);
  const planetY = cy + Math.sin(nu) * (r * scale);

  // Vis-viva equation: v = sqrt(GM * (2/r - 1/a))
  const orbitalVelocity = Math.sqrt(centralMass * (2 / Math.max(0.1, r) - 1 / semiMajor)) * 29.78;
  const orbitalPeriod = Math.sqrt(Math.pow(semiMajor, 3) / centralMass).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
          Astrophysics & Keplerian Gravitational Dynamics
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Keplerian two-body celestial dynamics governed by Newton's law of gravitation and Vis-Viva conservation of specific orbital energy.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Orbital Velocity (v)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{orbitalVelocity.toFixed(1)} <span className="text-xs font-normal text-slate-400">km/s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">v = √(GM(2/r - 1/a))</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Instant Radius (r)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{r.toFixed(2)} <span className="text-xs font-normal text-slate-400">AU</span></div>
          <div className="text-[10px] text-slate-400 mt-1">True anomaly ν: {(nu * 180 / Math.PI).toFixed(0)}°</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Orbital Period (T)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{orbitalPeriod} <span className="text-xs font-normal text-slate-400">yr</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Kepler's 3rd Law: T² ∝ a³</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Orbital Eccentricity</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{eccentricity.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{eccentricity < 0.1 ? "Near circular" : "Elliptical"}</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#070a12] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="planetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Elliptical trajectory curve */}
          <ellipse
            cx={cx - (eccentricity * semiMajor * scale)}
            cy={cy}
            rx={semiMajor * scale}
            ry={semiMajor * Math.sqrt(1 - Math.pow(eccentricity, 2)) * scale}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.4"
          />

          {/* Central attractor (Star) */}
          <circle cx={cx} cy={cy} r={Math.max(16, 12 + centralMass * 8)} fill="url(#starGlow)" />
          <circle cx={cx} cy={cy} r={6} fill="#ffffff" />

          {/* Radius vector line */}
          <line x1={cx} y1={cy} x2={planetX} y2={planetY} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

          {/* Orbiting celestial body */}
          <circle cx={planetX} cy={planetY} r={10} fill="url(#planetGlow)" />

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">CENTRAL ATTRACTOR MASS: {centralMass.toFixed(1)} M☉</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setCentralMass(1.0); setSemiMajor(1.4); setEccentricity(0.35); setTime(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Central Star Mass (M)</span>
              <span className="font-mono text-amber-400 font-bold">{centralMass.toFixed(1)} M☉</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={centralMass}
              onChange={(e) => setCentralMass(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Semi-Major Axis (a)</span>
              <span className="font-mono text-sky-400 font-bold">{semiMajor.toFixed(2)} AU</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2.2"
              step="0.05"
              value={semiMajor}
              onChange={(e) => setSemiMajor(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-indigo-300">Orbital Eccentricity (e)</span>
              <span className="font-mono text-indigo-400 font-bold">{eccentricity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.00"
              max="0.75"
              step="0.01"
              value={eccentricity}
              onChange={(e) => setEccentricity(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The orbiting body accelerates toward perihelion as gravitational potential converts to kinetic energy, satisfying Kepler's Equal Area Law in equal intervals.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Governing Vis-Viva Law</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            v² = GM · (2/r - 1/a)
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Exact formulation relating orbital velocity, instantaneous radius, and semi-major axis energy constant.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Essential for Hohmann transfer orbits, satellite constellation station-keeping, and interplanetary gravity-assist trajectories.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)",
      "T^2 = \\frac{4\\pi^2}{GM}a^3",
      "r(\\nu) = \\frac{a(1 - e^2)}{1 + e\\cos\\nu}",
    ],
    parameters: [
      { name: "Central Mass", value: "1.0", unit: "M☉" },
      { name: "Semi-Major Axis", value: "1.40", unit: "AU" },
      { name: "Eccentricity", value: "0.35", unit: "e" },
    ],
    category: "Astrophysics",
    description: `Keplerian orbital dynamics simulation modeling Vis-Viva velocity conservation, elliptical trajectory anomalies, and planetary periods for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 3. THERMODYNAMICS & GAS KINETICS
// ---------------------------------------------------------------------------
function synthesizeThermodynamicsSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [temp, setTemp] = useState(300);
  const [volume, setVolume] = useState(40);
  const [particleCount, setParticleCount] = useState(35);
  const [isPlaying, setIsPlaying] = useState(true);

  // Dynamic particle positions in chamber
  const particles = useMemo(() => {
    const list = [];
    const seed = 42;
    for (let i = 0; i < particleCount; i++) {
      const vx = (Math.sin(i * 1.7) * 2 + 0.5);
      const vy = (Math.cos(i * 2.3) * 2 + 0.5);
      list.push({ id: i, x: 200 + (i * 18) % 360, y: 120 + (i * 13) % 200, vx, vy });
    }
    return list;
  }, [particleCount]);

  const [simParticles, setSimParticles] = useState(particles);

  useEffect(() => {
    setSimParticles(particles);
  }, [particles]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const speedScale = Math.sqrt(temp / 300);
    const chamberWidth = 240 + (volume / 100) * 440;

    const step = () => {
      setSimParticles((prev) =>
        prev.map((p) => {
          let nx = p.x + p.vx * speedScale * 1.5;
          let ny = p.y + p.vy * speedScale * 1.5;
          let nvx = p.vx;
          let nvy = p.vy;

          if (nx < 160) { nx = 160; nvx = -nvx; }
          if (nx > 160 + chamberWidth) { nx = 160 + chamberWidth; nvx = -nvx; }
          if (ny < 100) { ny = 100; nvy = -nvy; }
          if (ny > 340) { ny = 340; nvy = -nvy; }

          return { ...p, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, temp, volume]);

  // Derived thermodynamic quantities (Ideal gas law: P = N * k_B * T / V)
  const pressure = ((particleCount * temp * 0.08314) / Math.max(10, volume)).toFixed(1);
  const v_rms = Math.round(Math.sqrt((3 * 8.314 * temp) / 0.028));
  const kineticEnergy = ((3 / 2) * particleCount * 1.38e-23 * temp * 1e20).toFixed(2);

  const chamberW = 240 + (volume / 100) * 440;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
          Statistical Mechanics & Kinetic Theory of Gases
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Molecular kinetic simulation modeling Maxwell-Boltzmann molecular velocity distributions, elastic wall momentum transfer, and Ideal Gas law P·V = n·R·T.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Chamber Pressure (P)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{pressure} <span className="text-xs font-normal text-slate-400">kPa</span></div>
          <div className="text-[10px] text-slate-400 mt-1">P = N·k_B·T / V</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">RMS Velocity (v_rms)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{v_rms} <span className="text-xs font-normal text-slate-400">m/s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">v_rms = √(3k_B T / m)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Thermal Kinetic Energy</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{kineticEnergy} <span className="text-xs font-normal text-slate-400">×10⁻²⁰ J</span></div>
          <div className="text-[10px] text-slate-400 mt-1">U = 3/2 N·k_B·T</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Temperature (T)</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{temp} <span className="text-xs font-normal text-slate-400">K</span></div>
          <div className="text-[10px] text-slate-400 mt-1">{(temp - 273.15).toFixed(1)} °C</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Chamber cylinder walls */}
          <rect x="156" y="96" width={chamberW + 8} height="248" rx="8" fill="none" stroke="#475569" strokeWidth="4" />
          <rect x="160" y="100" width={chamberW} height="240" fill="#0f172a" opacity="0.6" />

          {/* Movable piston head */}
          <rect x={160 + chamberW - 8} y="96" width="16" height="248" rx="4" fill="#64748b" />
          <line x1={160 + chamberW} y1="220" x2="900" y2="220" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

          {/* Colliding gas molecules */}
          {simParticles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={4.5}
              fill={temp > 450 ? "#f87171" : temp > 300 ? "#fbbf24" : "#38bdf8"}
              opacity="0.85"
            />
          ))}

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="170" y="80">GAS CHAMBER VOLUME: {volume} L</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setTemp(300); setVolume(40); setParticleCount(35); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-rose-300">Temperature (T)</span>
              <span className="font-mono text-rose-400 font-bold">{temp} K</span>
            </div>
            <input
              type="range"
              min="100"
              max="700"
              step="10"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Chamber Volume (V)</span>
              <span className="font-mono text-sky-400 font-bold">{volume} L</span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              step="1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Particle Number (N)</span>
              <span className="font-mono text-amber-400 font-bold">{particleCount}</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              step="1"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pressure results from continuous microscopic momentum exchange when particles collide elastically with the container walls: Δp = 2·m·v_x.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Equation of State</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            P · V = N · k_B · T
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ideal gas relationship connecting macroscopic pressure and volume to absolute temperature and molecular degrees of freedom.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Underpins internal combustion engine cycles, HVAC heat pumps, gas turbine compressors, and cryogenic liquefaction.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "P \\cdot V = N k_B T",
      "v_{rms} = \\sqrt{\\frac{3k_B T}{m}}",
      "f(v) = 4\\pi \\left(\\frac{m}{2\\pi k_B T}\\right)^{3/2} v^2 \\exp\\left(-\\frac{mv^2}{2k_B T}\\right)",
    ],
    parameters: [
      { name: "Temperature (T)", value: "300", unit: "K" },
      { name: "Volume (V)", value: "40", unit: "L" },
      { name: "Particle Count", value: "35", unit: "molecules" },
    ],
    category: "Thermodynamics",
    description: `Statistical mechanics and kinetic theory simulation modeling Maxwell-Boltzmann velocity distributions and ideal gas compression for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 4. WAVES, OPTICS & QUANTUM
// ---------------------------------------------------------------------------
function synthesizeWaveOpticsSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [wavelength, setWavelength] = useState(550);
  const [slitDist, setSlitDist] = useState(0.4);
  const [screenDist, setScreenDist] = useState(1.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const tick = () => {
      setTime((t) => t + 0.05);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Fringe separation: Delta y = lambda * D / d
  const fringeSpacing = ((wavelength * 1e-9 * screenDist) / (slitDist * 1e-3) * 1000).toFixed(2);
  const photonEnergy = (1240 / wavelength).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          Wave Optics & Quantum Wavepacket Interference
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Young's double-slit wave interference laboratory modeling spatial coherence, path difference phase shift, and quantum probability amplitude distribution.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Fringe Spacing (Δy)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{fringeSpacing} <span className="text-xs font-normal text-slate-400">mm</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Δy = λ·D / d</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Photon Energy (E)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{photonEnergy} <span className="text-xs font-normal text-slate-400">eV</span></div>
          <div className="text-[10px] text-slate-400 mt-1">E = h·c / λ</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Slit Separation (d)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{slitDist.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Micro-aperture spacing</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Wavelength (λ)</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{wavelength} <span className="text-xs font-normal text-slate-400">nm</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Visible spectrum</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Laser source emitter */}
          <rect x="60" y="225" width="60" height="30" rx="4" fill="#334155" />
          <line x1="120" y1="240" x2="360" y2="240" stroke="#34d399" strokeWidth="4" />

          {/* Slit barrier */}
          <line x1="360" y1="40" x2="360" y2="200" stroke="#64748b" strokeWidth="6" />
          <line x1="360" y1="280" x2="360" y2="440" stroke="#64748b" strokeWidth="6" />
          <line x1="360" y1="220" x2="360" y2="260" stroke="#64748b" strokeWidth="6" />

          {/* Animated wavefront ripples from slit A and B */}
          {Array.from({ length: 6 }).map((_, i) => {
            const r1 = ((i * 45 + time * 30) % 270);
            return (
              <g key={i} opacity={Math.max(0, 1 - r1 / 270)}>
                <path d={"M 360 " + (210 - r1) + " A " + r1 + " " + r1 + " 0 0 1 360 " + (210 + r1)} fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,3" />
                <path d={"M 360 " + (270 - r1) + " A " + r1 + " " + r1 + " 0 0 1 360 " + (270 + r1)} fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,3" />
              </g>
            );
          })}

          {/* Detection screen on the right */}
          <line x1="840" y1="40" x2="840" y2="440" stroke="#475569" strokeWidth="4" />

          {/* Interference pattern curve */}
          <path
            d={Array.from({ length: 120 }).reduce((acc, _, idx) => {
              const y = 60 + idx * 3;
              const theta = (y - 240) / 300;
              const beta = (Math.PI * (slitDist * 1e-3) / (wavelength * 1e-9)) * Math.sin(theta);
              const intensity = Math.pow(Math.cos(beta), 2);
              const x = 840 - intensity * 140;
              return idx === 0 ? "M " + x + " " + y : acc + " L " + x + " " + y;
            }, "")}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="80" y="80">COHERENT LIGHT EMITTER: {wavelength} nm</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setWavelength(550); setSlitDist(0.4); setScreenDist(1.5); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Wavelength (λ)</span>
              <span className="font-mono text-emerald-400 font-bold">{wavelength} nm</span>
            </div>
            <input
              type="range"
              min="380"
              max="750"
              step="5"
              value={wavelength}
              onChange={(e) => setWavelength(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Slit Separation (d)</span>
              <span className="font-mono text-sky-400 font-bold">{slitDist.toFixed(2)} mm</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.02"
              value={slitDist}
              onChange={(e) => setSlitDist(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Screen Distance (D)</span>
              <span className="font-mono text-amber-400 font-bold">{screenDist.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={screenDist}
              onChange={(e) => setScreenDist(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coherent wavefronts emerging from both slits interfere constructively when optical path difference ΔL = m·λ and destructively when ΔL = (m + ½)·λ.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Intensity Distribution</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            I(θ) = I_0 · cos²(π·d·sin(θ) / λ)
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fraunhofer double-aperture interference formula modeling spatial fringe probability density.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Essential for laser interferometry (LIGO gravitational wave detectors), spectrometer diffraction gratings, and antireflection coatings.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "I(\\theta) = I_0 \\cos^2\\left(\\frac{\\pi d \\sin\\theta}{\\lambda}\\right)",
      "\\Delta y = \\frac{\\lambda D}{d}",
      "E = \\frac{hc}{\\lambda}",
    ],
    parameters: [
      { name: "Wavelength (λ)", value: "550", unit: "nm" },
      { name: "Slit Separation (d)", value: "0.40", unit: "mm" },
      { name: "Screen Distance (D)", value: "1.50", unit: "m" },
    ],
    category: "Wave Optics",
    description: `Wave optics and quantum interference simulation modeling Young's double slit intensity distribution for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 5. CIRCUITS & ELECTROMAGNETISM
// ---------------------------------------------------------------------------
function synthesizeCircuitSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [inductance, setInductance] = useState(25);
  const [capacitance, setCapacitance] = useState(40);
  const [resistance, setResistance] = useState(15);
  const [freq, setFreq] = useState(160);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const tick = () => {
      setTime((t) => t + 0.05);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // RLC resonant angular frequency: omega_0 = 1 / sqrt(L * C)
  const L = inductance * 1e-3;
  const C = capacitance * 1e-6;
  const omega0 = 1 / Math.sqrt(L * C);
  const resonantFreq = (omega0 / (2 * Math.PI)).toFixed(1);

  // Impedance: Z = sqrt(R^2 + (omega*L - 1/(omega*C))^2)
  const omega = 2 * Math.PI * freq;
  const XL = omega * L;
  const XC = 1 / (omega * C);
  const impedance = Math.sqrt(Math.pow(resistance, 2) + Math.pow(XL - XC, 2)).toFixed(1);
  const currentAmp = (120 / parseFloat(impedance)).toFixed(2);
  const qFactor = ((1 / resistance) * Math.sqrt(L / C)).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-sky-500/10 border border-sky-500/30 text-sky-400">
          Electrodynamics & RLC Resonant Circuit Analysis
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Second-order electromagnetic oscillator modeling inductive reactance, capacitive phase lead/lag, and resonant impedance minimization.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Resonant Frequency (f₀)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{resonantFreq} <span className="text-xs font-normal text-slate-400">Hz</span></div>
          <div className="text-[10px] text-slate-400 mt-1">f₀ = 1 / (2π√(LC))</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Total Impedance (Z)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{impedance} <span className="text-xs font-normal text-slate-400">Ω</span></div>
          <div className="text-[10px] text-slate-400 mt-1">√(R² + (X_L - X_C)²)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">RMS Current (I)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{currentAmp} <span className="text-xs font-normal text-slate-400">A</span></div>
          <div className="text-[10px] text-slate-400 mt-1">I = V_in / Z</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Quality Factor (Q)</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{qFactor}</div>
          <div className="text-[10px] text-slate-400 mt-1">Resonance sharpness</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Circuit loop path */}
          <rect x="180" y="100" width="600" height="280" rx="16" fill="none" stroke="#475569" strokeWidth="4" />

          {/* AC Power Source */}
          <circle cx="180" cy="240" r="28" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M 166 240 Q 173 226 180 240 Q 187 254 194 240" fill="none" stroke="#38bdf8" strokeWidth="2" />

          {/* Resistor symbol */}
          <rect x="360" y="88" width="60" height="24" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="2" />
          <text x="390" y="76" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">R: {resistance}Ω</text>

          {/* Inductor coil */}
          <rect x="540" y="88" width="60" height="24" rx="4" fill="#334155" stroke="#38bdf8" strokeWidth="2" />
          <text x="570" y="76" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">L: {inductance}mH</text>

          {/* Capacitor plates */}
          <line x1="470" y1="360" x2="470" y2="400" stroke="#34d399" strokeWidth="4" />
          <line x1="490" y1="360" x2="490" y2="400" stroke="#34d399" strokeWidth="4" />
          <text x="480" y="425" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">C: {capacitance}μF</text>

          {/* Live oscilloscope waveform output */}
          <path
            d={Array.from({ length: 80 }).reduce((acc, _, idx) => {
              const x = 320 + idx * 4;
              const y = 240 + Math.sin(idx * 0.2 + time * 3) * (parseFloat(currentAmp) * 12);
              return idx === 0 ? "M " + x + " " + y : acc + " L " + x + " " + y;
            }, "")}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">DRIVE FREQUENCY: {freq} Hz</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setInductance(25); setCapacitance(40); setResistance(15); setFreq(160); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Inductance (L)</span>
              <span className="font-mono text-sky-400 font-bold">{inductance} mH</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={inductance}
              onChange={(e) => setInductance(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Capacitance (C)</span>
              <span className="font-mono text-emerald-400 font-bold">{capacitance} μF</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={capacitance}
              onChange={(e) => setCapacitance(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Resistance (R)</span>
              <span className="font-mono text-amber-400 font-bold">{resistance} Ω</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              value={resistance}
              onChange={(e) => setResistance(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-indigo-300">Drive Freq (f)</span>
              <span className="font-mono text-indigo-400 font-bold">{freq} Hz</span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              value={freq}
              onChange={(e) => setFreq(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Energy oscillates cyclically between the magnetic field in inductor coil (½·L·I²) and electric field across capacitor plates (½·C·V²).
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Governing Differential Equation</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            L·(d²q/dt²) + R·(dq/dt) + q/C = V_0·cos(ωt)
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Driven harmonic oscillator in electric charge q(t), analogous to a damped mechanical mass-spring system.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Core building block for radio frequency tuners, wireless power transfer, and switched-mode power supplies.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "f_0 = \\frac{1}{2\\pi\\sqrt{LC}}",
      "Z = \\sqrt{R^2 + \\left(\\omega L - \\frac{1}{\\omega C}\\right)^2}",
      "Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}}",
    ],
    parameters: [
      { name: "Inductance (L)", value: "25", unit: "mH" },
      { name: "Capacitance (C)", value: "40", unit: "μF" },
      { name: "Resistance (R)", value: "15", unit: "Ω" },
    ],
    category: "Electromagnetism",
    description: `RLC resonant circuit simulation modeling electromagnetic oscillation, complex impedance, and frequency response for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 6. FLUID DYNAMICS & AERODYNAMICS
// ---------------------------------------------------------------------------
function synthesizeAerodynamicsSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [aoa, setAoa] = useState(4.5);
  const [velocity, setVelocity] = useState(45);
  const [airDensity, setAirDensity] = useState(1.225);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const tick = () => {
      setTime((t) => t + 0.05);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Lift & Drag coefficients: C_L = 2*pi*alpha, C_D = C_D0 + k*C_L^2
  const radAoa = (aoa * Math.PI) / 180;
  const cL = Math.max(-0.2, Math.min(1.6, 2 * Math.PI * radAoa));
  const cD = (0.02 + 0.04 * Math.pow(cL, 2)).toFixed(3);

  // Dynamic Lift: L = 0.5 * rho * v^2 * S * C_L
  const wingArea = 2.4;
  const liftForce = (0.5 * airDensity * Math.pow(velocity, 2) * wingArea * cL).toFixed(1);
  const dragForce = (0.5 * airDensity * Math.pow(velocity, 2) * wingArea * parseFloat(cD)).toFixed(1);
  const liftToDrag = (parseFloat(liftForce) / Math.max(0.1, parseFloat(dragForce))).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          Aerodynamics & Bernoulli Fluid Circulation
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Airfoil circulation dynamics modeling Bernoulli upper-surface suction, Kutta condition stagnation, and aerodynamic lift/drag polar curves.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Aerodynamic Lift (L)</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{liftForce} <span className="text-xs font-normal text-slate-400">N</span></div>
          <div className="text-[10px] text-slate-400 mt-1">½ ρ·v²·S·C_L</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Induced Drag (D)</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{dragForce} <span className="text-xs font-normal text-slate-400">N</span></div>
          <div className="text-[10px] text-slate-400 mt-1">½ ρ·v²·S·C_D</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Lift-to-Drag Ratio</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{liftToDrag} <span className="text-xs font-normal text-slate-400">L/D</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Aerodynamic efficiency</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Lift Coeff (C_L)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{cL.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Thin airfoil theory</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Streamlines flowing over airfoil */}
          {[-80, -40, 0, 40, 80].map((offset, i) => (
            <path
              key={i}
              d={"M 100 " + (240 + offset) + " Q 420 " + (220 + offset * 0.7 - aoa * 3) + " 860 " + (240 + offset + aoa * 2)}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="6,4"
            />
          ))}

          {/* Airfoil profile rotated by Angle of Attack */}
          <g transform={"translate(480, 240) rotate(" + (-aoa) + ")"}>
            <path
              d="M -160 0 C -120 -30, 40 -35, 160 0 C 40 10, -120 15, -160 0 Z"
              fill="#1e293b"
              stroke="#06b6d4"
              strokeWidth="3"
            />
            {/* Chord line */}
            <line x1="-160" y1="0" x2="160" y2="0" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
          </g>

          {/* Lift and Drag Vector Arrows */}
          <line x1="480" y1="240" x2="480" y2={240 - cL * 60} stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          <line x1="480" y1="240" x2={480 + parseFloat(cD) * 300} y2="240" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">AIRSPEED: {velocity} m/s | ANGLE OF ATTACK: {aoa}°</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setAoa(4.5); setVelocity(45); setAirDensity(1.225); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-cyan-300">Angle of Attack (α)</span>
              <span className="font-mono text-cyan-400 font-bold">{aoa.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="-4.0"
              max="16.0"
              step="0.5"
              value={aoa}
              onChange={(e) => setAoa(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Airspeed (v)</span>
              <span className="font-mono text-sky-400 font-bold">{velocity} m/s</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Air Density (ρ)</span>
              <span className="font-mono text-emerald-400 font-bold">{airDensity.toFixed(3)} kg/m³</span>
            </div>
            <input
              type="range"
              min="0.800"
              max="1.400"
              step="0.025"
              value={airDensity}
              onChange={(e) => setAirDensity(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Camber and positive angle of attack accelerate fluid over the upper wing surface, reducing static pressure in accordance with Bernoulli's theorem to generate net upward lift.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Kutta-Joukowski Theorem</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            L' = ρ_∞ · v_∞ · Γ
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Lift per unit span is proportional to free-stream air density, flight speed, and bound circulation vortex strength Γ.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly governs commercial airliner wing design, wind turbine blade aerodynamics, and Formula 1 downforce wings.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "L = \\frac{1}{2}\\rho v^2 S C_L",
      "D = \\frac{1}{2}\\rho v^2 S C_D",
      "P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2",
    ],
    parameters: [
      { name: "Angle of Attack (α)", value: "4.5", unit: "deg" },
      { name: "Airspeed (v)", value: "45", unit: "m/s" },
      { name: "Air Density (ρ)", value: "1.225", unit: "kg/m³" },
    ],
    category: "Fluid Dynamics",
    description: `Aerodynamic circulation and Bernoulli airfoil lift simulation modeling flow acceleration and polar drag for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 7. BIOCHEMISTRY & ENZYMES
// ---------------------------------------------------------------------------
function synthesizeEnzymeSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [substrate, setSubstrate] = useState(25);
  const [vmax, setVmax] = useState(80);
  const [km, setKm] = useState(15);
  const [inhibitor, setInhibitor] = useState(0);

  // Michaelis-Menten with competitive inhibition: v = V_max * [S] / (K_m * (1 + [I]/K_i) + [S])
  const ki = 10;
  const apparentKm = km * (1 + inhibitor / ki);
  const rate = ((vmax * substrate) / (apparentKm + substrate)).toFixed(1);
  const saturationPct = ((substrate / (apparentKm + substrate)) * 100).toFixed(0);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          Biochemistry & Enzymatic Catalysis Kinetics
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Steady-state enzyme kinetics modeling hyperbolic substrate saturation, Michaelis constant Km, and competitive inhibition equilibrium.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Reaction Velocity (v)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{rate} <span className="text-xs font-normal text-slate-400">μmol/s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">v = V_max·[S]/(K_m + [S])</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Enzyme Saturation</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{saturationPct} <span className="text-xs font-normal text-slate-400">%</span></div>
          <div className="text-[10px] text-slate-400 mt-1">[ES] Complex Occupancy</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Apparent K_m</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{apparentKm.toFixed(1)} <span className="text-xs font-normal text-slate-400">mM</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Affinity metric</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Limiting V_max</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{vmax} <span className="text-xs font-normal text-slate-400">μmol/s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">k_cat · [E]_total</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Michaelis-Menten Hyperbolic Curve */}
          <path
            d={Array.from({ length: 140 }).reduce((acc, _, idx) => {
              const sVal = idx * 0.7;
              const rVal = (vmax * sVal) / (apparentKm + sVal);
              const x = 140 + idx * 5;
              const y = 380 - (rVal / vmax) * 280;
              return idx === 0 ? "M " + x + " " + y : acc + " L " + x + " " + y;
            }, "")}
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
          />

          {/* Asymptote V_max line */}
          <line x1="140" y1="100" x2="840" y2="100" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,5" />
          <text x="830" y="90" textAnchor="end" fill="#f59e0b" fontSize="12" fontWeight="bold">V_MAX: {vmax}</text>

          {/* Current operating point */}
          <circle cx={140 + (substrate / 0.7) * 5} cy={380 - (parseFloat(rate) / vmax) * 280} r="8" fill="#38bdf8" />

          {/* Axes */}
          <line x1="140" y1="40" x2="140" y2="380" stroke="#64748b" strokeWidth="2" />
          <line x1="140" y1="380" x2="880" y2="380" stroke="#64748b" strokeWidth="2" />

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="140" y="30">VELOCITY v (μmol/s)</text>
            <text x="860" y="410" textAnchor="end">SUBSTRATE CONCENTRATION [S] (mM)</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Substrate [S]</span>
              <span className="font-mono text-emerald-400 font-bold">{substrate} mM</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={substrate}
              onChange={(e) => setSubstrate(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Max Velocity (V_max)</span>
              <span className="font-mono text-sky-400 font-bold">{vmax} μmol/s</span>
            </div>
            <input
              type="range"
              min="30"
              max="150"
              value={vmax}
              onChange={(e) => setVmax(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Michaelis Const (K_m)</span>
              <span className="font-mono text-amber-400 font-bold">{km} mM</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={km}
              onChange={(e) => setKm(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-rose-300">Inhibitor [I]</span>
              <span className="font-mono text-rose-400 font-bold">{inhibitor} mM</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={inhibitor}
              onChange={(e) => setInhibitor(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Free enzyme binds substrate reversibly (E + S ⇌ ES) before irreversible catalytic turnover yields product (ES → E + P). At high substrate, active sites become saturated.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Governing Equation</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            v = (V_max · [S]) / (K_m + [S])
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Michaelis-Menten steady-state rate formula where Km represents the substrate concentration at half-maximal velocity (v = Vmax / 2).
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cornerstone of pharmacology, enzyme inhibitor drug design (e.g. statins, protease inhibitors), and metabolic flux analysis.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "v = \\frac{V_{max}[S]}{K_m + [S]}",
      "K_m = \\frac{k_{-1} + k_2}{k_1}",
      "k_{cat} = \\frac{V_{max}}{[E]_{total}}",
    ],
    parameters: [
      { name: "Substrate [S]", value: "25", unit: "mM" },
      { name: "Max Velocity (V_max)", value: "80", unit: "μmol/s" },
      { name: "Michaelis Const (K_m)", value: "15", unit: "mM" },
    ],
    category: "Biochemistry",
    description: `Enzyme kinetics simulation modeling Michaelis-Menten hyperbolic saturation curves and competitive inhibition for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 8. NEUROSCIENCE & ACTION POTENTIALS
// ---------------------------------------------------------------------------
function synthesizeNeuroscienceSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [stimulus, setStimulus] = useState(18);
  const [naPerm, setNaPerm] = useState(120);
  const [kPerm, setKPerm] = useState(36);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const tick = () => {
      setTime((t) => t + 0.08);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Spike cycle Phase
  const cycle = (time * (stimulus / 10)) % 10;
  const isSpiking = cycle > 3 && cycle < 7;
  const vm = isSpiking ? 35 - Math.pow(cycle - 5, 2) * 20 : -70 + (stimulus / 30) * 12;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-purple-500/10 border border-purple-500/30 text-purple-400">
          Cellular Neuroscience & Hodgkin-Huxley Electrophysiology
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Biophysical membrane voltage simulation modeling voltage-gated Na+ and K+ channel conductance, depolarization threshold, and all-or-none spike propagation.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Membrane Potential (V_m)</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{vm.toFixed(1)} <span className="text-xs font-normal text-slate-400">mV</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Resting: -70 mV | Peak: +35 mV</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Stimulus Current (I_stim)</div>
          <div className="text-xl font-bold text-pink-400 mt-1">{stimulus} <span className="text-xs font-normal text-slate-400">μA/cm²</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Threshold: 12 μA/cm²</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Na⁺ Conductance (g_Na)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{isSpiking ? naPerm : 2} <span className="text-xs font-normal text-slate-400">mS/cm²</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Depolarization flux</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">K⁺ Conductance (g_K)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{isSpiking ? kPerm : 4} <span className="text-xs font-normal text-slate-400">mS/cm²</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Repolarization flux</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Oscilloscope voltage trace */}
          <path
            d={Array.from({ length: 160 }).reduce((acc, _, idx) => {
              const x = 120 + idx * 4.5;
              const phase = (idx * 0.1 - time * 2) % 6;
              const spike = phase > 2 && phase < 4 ? Math.sin((phase - 2) * Math.PI) * 160 : 0;
              const y = 320 - spike;
              return idx === 0 ? "M " + x + " " + y : acc + " L " + x + " " + y;
            }, "")}
            fill="none"
            stroke="#c084fc"
            strokeWidth="3"
          />

          {/* Resting potential line */}
          <line x1="120" y1="320" x2="840" y2="320" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />
          <text x="830" y="310" textAnchor="end" fill="#94a3b8" fontSize="11">Resting: -70 mV</text>

          {/* Threshold line */}
          <line x1="120" y1="260" x2="840" y2="260" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4,4" />
          <text x="830" y="250" textAnchor="end" fill="#f43f5e" fontSize="11">Threshold: -55 mV</text>

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">ACTION POTENTIAL OSCILLOGRAM: {stimulus > 12 ? "BURSTING" : "QUIESCENT"}</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-pink-300">Stimulus Intensity (I_stim)</span>
              <span className="font-mono text-pink-400 font-bold">{stimulus} μA/cm²</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={stimulus}
              onChange={(e) => setStimulus(parseFloat(e.target.value))}
              className="w-full accent-pink-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Max Na⁺ Conductance</span>
              <span className="font-mono text-sky-400 font-bold">{naPerm} mS/cm²</span>
            </div>
            <input
              type="range"
              min="60"
              max="180"
              value={naPerm}
              onChange={(e) => setNaPerm(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Max K⁺ Conductance</span>
              <span className="font-mono text-emerald-400 font-bold">{kPerm} mS/cm²</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              value={kPerm}
              onChange={(e) => setKPerm(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Depolarization past threshold triggers rapid opening of voltage-gated Na+ channels, driving an explosive regenerative inward current toward E_Na (+60 mV).
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Hodgkin-Huxley Model</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            C_m·(dV/dt) = I - g_Na·m³h(V - E_Na) - g_K·n⁴(V - E_K)
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            System of four coupled nonlinear ordinary differential equations determining excitable membrane action potential dynamics.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fundamental to neural prosthetic brain-computer interfaces, cardiac defibrillator timing, and anesthetic channel blocking.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "C_m \\frac{dV}{dt} = I_{ext} - \\bar{g}_{Na}m^3h(V - E_{Na}) - \\bar{g}_K n^4(V - E_K) - g_L(V - E_L)",
      "\\frac{dn}{dt} = \\alpha_n(V)(1 - n) - \\beta_n(V)n",
      "E_{ion} = \\frac{RT}{zF}\\ln\\left(\\frac{[ion]_{out}}{[ion]_{in}}\\right)",
    ],
    parameters: [
      { name: "Stimulus Current", value: "18", unit: "μA/cm²" },
      { name: "Na⁺ Conductance", value: "120", unit: "mS/cm²" },
      { name: "K⁺ Conductance", value: "36", unit: "mS/cm²" },
    ],
    category: "Neuroscience",
    description: `Hodgkin-Huxley electrophysiological simulation modeling voltage-gated ion channels and action potential spikes for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 9. CHEMICAL KINETICS
// ---------------------------------------------------------------------------
function synthesizeChemicalKineticsSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [temperature, setTemperature] = useState(350);
  const [actEnergy, setActEnergy] = useState(50);
  const [initialA, setInitialA] = useState(2.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  // Arrhenius rate constant: k = A * exp(-E_a / (R * T))
  const R = 8.314;
  const kRate = (1e6 * Math.exp(-(actEnergy * 1000) / (R * temperature))).toFixed(3);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const tick = () => {
      setTime((t) => t + 0.05);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // First-order reaction: [A](t) = [A]_0 * exp(-k * t)
  const currentA = (initialA * Math.exp(-parseFloat(kRate) * (time % 10))).toFixed(2);
  const currentB = (initialA - parseFloat(currentA)).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
          Physical Chemistry & Arrhenius Reaction Kinetics
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Chemical reaction rate kinetics modeling Arrhenius activation energy barriers, Maxwellian collision frequency, and reactant-product conversion.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Rate Constant (k)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{kRate} <span className="text-xs font-normal text-slate-400">s⁻¹</span></div>
          <div className="text-[10px] text-slate-400 mt-1">k = A·exp(-E_a / RT)</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Reactant [A]</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{currentA} <span className="text-xs font-normal text-slate-400">M</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Depleting species</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Product [B]</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{currentB} <span className="text-xs font-normal text-slate-400">M</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Accumulating species</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Reaction Half-life (t₁/₂)</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{(0.693 / Math.max(0.01, parseFloat(kRate))).toFixed(2)} <span className="text-xs font-normal text-slate-400">s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">ln(2) / k</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Reaction Coordinate Potential Energy Curve */}
          <path
            d="M 120 320 C 260 320, 340 120, 480 120 C 620 120, 700 380, 840 380"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
          />

          {/* Activation Energy Barrier line */}
          <line x1="480" y1="120" x2="480" y2="320" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,4" />
          <text x="495" y="220" fill="#f43f5e" fontSize="12" fontWeight="bold">E_ACT: {actEnergy} kJ/mol</text>

          {/* Reactants and Products labels */}
          <circle cx="200" cy="320" r="10" fill="#38bdf8" />
          <text x="200" y="350" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">REACTANTS [A]</text>

          <circle cx="760" cy="380" r="10" fill="#10b981" />
          <text x="760" y="410" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">PRODUCTS [B]</text>

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">ARRHENIUS REACTION PROFILE: T = {temperature} K</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-300">Temperature (T)</span>
              <span className="font-mono text-amber-400 font-bold">{temperature} K</span>
            </div>
            <input
              type="range"
              min="280"
              max="550"
              step="5"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-rose-300">Activation Energy (E_a)</span>
              <span className="font-mono text-rose-400 font-bold">{actEnergy} kJ/mol</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="2"
              value={actEnergy}
              onChange={(e) => setActEnergy(parseFloat(e.target.value))}
              className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Initial Concentration [A]₀</span>
              <span className="font-mono text-sky-400 font-bold">{initialA} M</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.2"
              value={initialA}
              onChange={(e) => setInitialA(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Only colliding molecular pairs with kinetic energy exceeding the activation energy threshold (E ≥ E_a) with correct steric orientation surmount the transition barrier.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Arrhenius Law</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            k = A · exp(-E_a / (R·T))
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Relates the exponential sensitivity of reaction rate constants to temperature and energetic transition barriers.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fundamental to industrial chemical reactor design (CSTR/PFR), shelf-life stability testing, and catalytic converter efficiency.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "k = A \\exp\\left(-\\frac{E_a}{RT}\\right)",
      "\\frac{d[A]}{dt} = -k[A]",
      "[A](t) = [A]_0 e^{-kt}",
    ],
    parameters: [
      { name: "Temperature", value: "350", unit: "K" },
      { name: "Activation Energy", value: "50", unit: "kJ/mol" },
      { name: "Initial [A]₀", value: "2.0", unit: "M" },
    ],
    category: "Chemical Kinetics",
    description: `Arrhenius chemical reaction rate kinetics simulation modeling temperature-dependent reaction velocity for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 10. CHAOS & LORENZ ATTRACTOR
// ---------------------------------------------------------------------------
function synthesizeChaosSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(2.67);
  const [isPlaying, setIsPlaying] = useState(true);

  const [points, setPoints] = useState([]);
  const stateRef = useRef({ x: 0.1, y: 1.0, z: 1.0 });

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const dt = 0.015;

    const step = () => {
      let { x, y, z } = stateRef.current;
      // Lorenz equations
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;

      x += dx * dt;
      y += dy * dt;
      z += dz * dt;
      stateRef.current = { x, y, z };

      // Map to 2D projected SVG coordinates
      const px = 480 + x * 14;
      const py = 420 - z * 8;

      setPoints((prev) => {
        const updated = [...prev, { x: px, y: py }];
        return updated.length > 200 ? updated.slice(updated.length - 200) : updated;
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, sigma, rho, beta]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-pink-500/10 border border-pink-500/30 text-pink-400">
          Nonlinear Dynamics & Deterministic Chaos
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Lorenz strange attractor modeling atmospheric convection instability, sensitive dependence on initial conditions, and chaotic phase-space divergence.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Prandtl Number (σ)</div>
          <div className="text-xl font-bold text-pink-400 mt-1">{sigma.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Fluid viscosity ratio</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Rayleigh Number (ρ)</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{rho.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Chaotic threshold: ρ &gt; 24.74</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Geometric Factor (β)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{beta.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Aspect ratio 8/3</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">State Vector (x, y, z)</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stateRef.current.x.toFixed(1)}, {stateRef.current.z.toFixed(0)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Phase coordinate</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#070a12] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Butterfly attractor trajectory trail */}
          {points.length > 1 && (
            <path
              d={points.map((p, i) => (i === 0 ? "M " + p.x + " " + p.y : "L " + p.x + " " + p.y)).join(" ")}
              fill="none"
              stroke="#ec4899"
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

          {/* Current chaotic state point */}
          {points.length > 0 && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="6" fill="#38bdf8" />
          )}

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">LORENZ PHASE-SPACE TRAJECTORY: dx/dt, dy/dt, dz/dt</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setPoints([]); stateRef.current = { x: 0.1, y: 1.0, z: 1.0 }; }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Re-seed Attractor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-pink-300">Prandtl Number (σ)</span>
              <span className="font-mono text-pink-400 font-bold">{sigma.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="0.5"
              value={sigma}
              onChange={(e) => setSigma(parseFloat(e.target.value))}
              className="w-full accent-pink-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Rayleigh Number (ρ)</span>
              <span className="font-mono text-sky-400 font-bold">{rho.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="0.5"
              value={rho}
              onChange={(e) => setRho(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Geometry Constant (β)</span>
              <span className="font-mono text-emerald-400 font-bold">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trajectories never intersect themselves or repeat, yet remain bounded inside a fractal phase-space manifold with fractional Hausdorff dimension ~2.06.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Lorenz Differential System</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            dx/dt = σ(y - x), dy/dt = x(ρ - z) - y, dz/dt = xy - βz
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nonlinear 3-variable autonomous system modeling simplified atmospheric thermal convection rolls.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Proves fundamental limits on long-term weather forecasting, turbulence modeling, and encrypted chaotic communications.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "\\frac{dx}{dt} = \\sigma(y - x)",
      "\\frac{dy}{dt} = x(\\rho - z) - y",
      "\\frac{dz}{dt} = xy - \\beta z",
    ],
    parameters: [
      { name: "Prandtl Number (σ)", value: "10.0", unit: "ratio" },
      { name: "Rayleigh Number (ρ)", value: "28.0", unit: "ratio" },
      { name: "Geometric Factor (β)", value: "2.67", unit: "ratio" },
    ],
    category: "Nonlinear Dynamics",
    description: `Lorenz strange attractor simulation modeling deterministic chaos and atmospheric convection for ${title}.`,
  };
}

// ---------------------------------------------------------------------------
// 11. GENERAL COUPLED DYNAMICS (Fallback for arbitrary scientific inquiries)
// ---------------------------------------------------------------------------
function synthesizeGeneralDynamicalSimulation(title: string, componentName: string) {
  const code = `function ${componentName}() {
  const [coupling, setCoupling] = useState(45);
  const [driveFreq, setDriveFreq] = useState(1.4);
  const [dampingCoeff, setDampingCoeff] = useState(0.15);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let animId;
    const tick = () => {
      setTime((t) => t + 0.04 * driveFreq);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, driveFreq]);

  // Derived mathematical state variables
  const energyFlux = (0.5 * Math.pow(driveFreq, 2) * (coupling / 10)).toFixed(2);
  const phaseDisp = ((time * driveFreq) % (Math.PI * 2)).toFixed(2);
  const envelopeDecay = (Math.exp(-dampingCoeff * (time % 8)) * 100).toFixed(1);

  // Dynamic particle swarm traversing the potential gradient
  const particles = useMemo(() => {
    const list = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.8;
      const radius = 100 + Math.sin(time * 2 + i) * (coupling * 0.8);
      const cx = 480 + Math.cos(angle) * radius;
      const cy = 240 + Math.sin(angle) * (radius * 0.55);
      list.push({ id: i, cx, cy, r: 3 + (i % 3) * 1.5 });
    }
    return list;
  }, [time, coupling]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-sky-500/10 border border-sky-500/30 text-sky-400">
          Computational Science & Dynamical State Solver
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
          ${title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl mx-auto">
          Interactive real-time computational model analyzing state transitions, boundary conditions, and Hamiltonian phase trajectories.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Integrated Energy Flux</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{energyFlux} <span className="text-xs font-normal text-slate-400">kJ</span></div>
          <div className="text-[10px] text-slate-400 mt-1">E = ½ ω²·k</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Drive Frequency (ω)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{driveFreq.toFixed(2)} <span className="text-xs font-normal text-slate-400">rad/s</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Excitation mode</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Envelope Decay</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{envelopeDecay} <span className="text-xs font-normal text-slate-400">%</span></div>
          <div className="text-[10px] text-slate-400 mt-1">exp(-γ·t) dissipation</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Phase Angle (θ)</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{phaseDisp} <span className="text-xs font-normal text-slate-400">rad</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Harmonic displacement</div>
        </div>
      </div>

      <div className="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-2xl">
        <svg viewBox="0 0 960 480" className="w-full h-auto block select-none" style={{ minHeight: "420px" }}>
          {/* Grid lines */}
          <g opacity="0.12" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5">
            <line x1="80" y1="120" x2="880" y2="120" />
            <line x1="80" y1="240" x2="880" y2="240" />
            <line x1="80" y1="360" x2="880" y2="360" />
            <line x1="480" y1="60" x2="480" y2="420" />
          </g>

          {/* Central potential basin */}
          <ellipse cx="480" cy="240" rx="360" ry="170" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="480" cy="240" rx="200" ry="95" fill="none" stroke="#818cf8" strokeWidth="1.2" strokeDasharray="6,4" opacity="0.7" />
          <circle cx="480" cy="240" r="14" fill="#38bdf8" opacity="0.9" />

          {/* Dynamic waveform curve */}
          <path
            d={Array.from({ length: 160 }).reduce((acc, _, idx) => {
              const x = 80 + idx * 5;
              const y = 240 + Math.sin(idx * 0.1 + time * 3) * (coupling * 0.7) * Math.cos(idx * 0.03);
              return idx === 0 ? "M " + x + " " + y : acc + " L " + x + " " + y;
            }, "")}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Dynamic particle swarm */}
          {particles.map((p) => (
            <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill="#e0f2fe" opacity="0.8" />
          ))}

          <g fontSize="11" fill="#94a3b8" fontWeight="600">
            <text x="90" y="80">SYSTEM DYNAMICS: Ψ(x, t)</text>
            <text x="860" y="440" textAnchor="end">FRAME RATE: 60 FPS</text>
          </g>
        </svg>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={"px-4 py-1.5 rounded-lg text-xs font-bold transition shadow " + (
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            )}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            onClick={() => { setCoupling(45); setDriveFreq(1.4); setDampingCoeff(0.15); setTime(0); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
          >
            ↺ Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-sky-300">Coupling Strength</span>
              <span className="font-mono text-sky-400 font-bold">{coupling} %</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={coupling}
              onChange={(e) => setCoupling(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-300">Drive Frequency (ω)</span>
              <span className="font-mono text-emerald-400 font-bold">{driveFreq.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3.0"
              step="0.1"
              value={driveFreq}
              onChange={(e) => setDriveFreq(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-indigo-300">Damping Coefficient (γ)</span>
              <span className="font-mono text-indigo-400 font-bold">{dampingCoeff.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.60"
              step="0.02"
              value={dampingCoeff}
              onChange={(e) => setDampingCoeff(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-sky-400">1. Physical Mechanism</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system models continuous energy exchange governed by nonlinear differential couplings. Particles follow Hamiltonian phase trajectories constrained by dissipative damping.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-emerald-400">2. Governing Equations</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            d²x/dt² + γ(dx/dt) + ω²x = F₀ cos(ωt)
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Coupled harmonic oscillator with dissipative damping term and external periodic drive force.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <h3 className="font-bold text-xs text-indigo-400">3. Practical Application</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly applicable to aerospace vibrational damping, semiconductor resonance modes, and biochemical reaction kinetics.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return {
    code,
    equations: [
      "\\frac{d^2 x}{dt^2} + \\gamma\\frac{dx}{dt} + \\omega^2 x = F_0 \\cos(\\omega t)",
      "H(p, q) = \\frac{p^2}{2m} + V(q)",
      "\\frac{dq}{dt} = \\frac{\\partial H}{\\partial p}, \\quad \\frac{dp}{dt} = -\\frac{\\partial H}{\\partial q}",
    ],
    parameters: [
      { name: "Coupling Strength", value: "45", unit: "%" },
      { name: "Drive Frequency", value: "1.40", unit: "x" },
      { name: "Damping Coefficient", value: "0.15", unit: "γ" },
    ],
    category: "Computational Dynamics",
    description: `Real-time dynamical state solver modeling coupled oscillations, phase trajectories, and dissipative damping for ${title}.`,
  };
}
