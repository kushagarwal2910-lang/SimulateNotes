export interface SimulationItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "Quantum" | "Astrophysics" | "Fluid Dynamics" | "Electronics" | "Biophysics" | "Neuroscience" | "Economics" | "Archaeology" | "Chemical Engineering" | string;
  rating: string;
  duration: string;
  date: string;
  description: string;
  previewUrl: string;
  jsxUrl: string;
  promptFile: string;
  equations: string[];
  keyParameters: { name: string; value: string; unit: string }[];
  accentColor: string;
  isDynamic?: boolean;
  currentStep?: string;
  currentDetail?: string;
  elapsedSec?: number;
  isError?: boolean;
  errorMessage?: string;
}

export const SIMULATIONS_CATALOG: SimulationItem[] = [
  {
    id: "bayes_theorem",
    slug: "bayes_theorem_conditional_probability",
    title: "Bayes' Theorem: Updating Beliefs with Evidence",
    subtitle: "Interactive Prior-to-Posterior Belief Updating with Evidence Marbles",
    category: "Mathematics / Probability",
    rating: "9.9/10 IMDB",
    duration: "Interactive",
    date: "May, 2025",
    description:
      "Interactive Bayesian probability laboratory where you can manipulate priors and likelihoods to observe real-time belief updating, total probability normalization, and posterior convergence.",
    previewUrl: "/simulations/bayes_theorem_conditional_probability/preview.html",
    jsxUrl: "/simulations/bayes_theorem_conditional_probability/BayesTheoremConditionalProbabilitySimulation.jsx",
    promptFile: "prompts/bayes_theorem_conditional_probability_prompt.json",
    equations: [
      "P(A|B) = [P(B|A) · P(A)] / P(B)",
      "P(B) = P(B|A)P(A) + P(B|¬A)P(¬A)",
      "P(A ∩ B) = P(A) · P(B|A)",
    ],
    keyParameters: [
      { name: "Prior: Left Bag", value: "0.50", unit: "prob" },
      { name: "Likelihood: P(Red|Left)", value: "0.70", unit: "prob" },
      { name: "Likelihood: P(Red|Right)", value: "0.30", unit: "prob" },
    ],
    accentColor: "#38bdf8",
  },
  {
    id: "quantum_tunneling",
    slug: "quantum_tunneling_barrier",
    title: "Quantum Tunneling: Barrier Penetration",
    subtitle: "Wavepacket Evanescent Decay & Exponential Transmission",
    category: "Quantum",
    rating: "9.8/10 IMDB",
    duration: "Interactive",
    date: "April, 2025",
    description:
      "Interactive wavepacket penetration through a classically impenetrable potential energy barrier (E < V₀), illustrating exponential evanescent decay, barrier matching, and mass scaling.",
    previewUrl: "/simulations/quantum_tunneling_barrier/preview.html",
    jsxUrl: "/simulations/quantum_tunneling_barrier/QuantumTunnelingBarrierSimulation.jsx",
    promptFile: "samples/quantum_tunneling_prompt.json",
    equations: [
      "T ≈ exp(-2κL)",
      "κ = √(2m(V₀ - E)) / ħ",
      "ψ(x) = C·e^(-κx) + D·e^(κx)",
    ],
    keyParameters: [
      { name: "Particle Energy", value: "4.5", unit: "eV" },
      { name: "Barrier Height", value: "6.5", unit: "eV" },
      { name: "Barrier Width", value: "1.2", unit: "nm" },
      { name: "Particle Mass", value: "1.0", unit: "m_e" },
    ],
    accentColor: "#38bdf8",
  },
  {
    id: "gravitational_orbit",
    slug: "gravitational_orbit_mechanics",
    title: "Keplerian Gravitational Orbital Dynamics",
    subtitle: "Vis-Viva Conservation & Multi-Body Gravity Wells",
    category: "Astrophysics",
    rating: "9.6/10 IMDB",
    duration: "Real-time",
    date: "March, 2025",
    description:
      "Keplerian two-body celestial orbital mechanics with vis-viva equation velocity vectors, gravitational potential energy curvature, and eccentricity manipulation.",
    previewUrl: "/simulations/gravitational_orbit_mechanics/preview.html",
    jsxUrl: "/simulations/gravitational_orbit_mechanics/GravitationalOrbitSimulation.jsx",
    promptFile: "samples/orbital_gravity_prompt.json",
    equations: [
      "v² = GM(2/r - 1/a)",
      "F = G(m₁m₂)/r²",
      "T² = (4π²/GM)·a³",
    ],
    keyParameters: [
      { name: "Central Mass", value: "1.0", unit: "M☉" },
      { name: "Semi-major Axis", value: "1.0", unit: "AU" },
      { name: "Orbital Eccentricity", value: "0.24", unit: "e" },
    ],
    accentColor: "#a855f7",
  },
  {
    id: "bernoulli_venturi",
    slug: "bernoulli",
    title: "Bernoulli & Venturi Flow Dynamics",
    subtitle: "Continuity Equation & Hydrodynamic Manometer Drops",
    category: "Fluid Dynamics",
    rating: "9.4/10 IMDB",
    duration: "Continuous",
    date: "April, 2025",
    description:
      "Constricted pipe fluid dynamics with dynamic manometer fluid columns, streamline velocity acceleration, and Bernoulli static pressure differential.",
    previewUrl: "/simulations/bernoulli/preview.html",
    jsxUrl: "/simulations/bernoulli/BernoulliSimulation.jsx",
    promptFile: "samples/bernoulli_simulation_prompt.json",
    equations: [
      "P₁ + ½ρv₁² = P₂ + ½ρv₂²",
      "A₁v₁ = A₂v₂ (Continuity)",
      "ΔP = ρ·g·Δh",
    ],
    keyParameters: [
      { name: "Inlet Diameter", value: "100", unit: "mm" },
      { name: "Throat Diameter", value: "40", unit: "mm" },
      { name: "Fluid Density", value: "1000", unit: "kg/m³" },
    ],
    accentColor: "#06b6d4",
  },
  {
    id: "lithium_ion_battery",
    slug: "lithium_ion_battery_dynamics",
    title: "Lithium-Ion Intercalation Dynamics",
    subtitle: "Electrochemical Kinetics & Butler-Volmer Transport",
    category: "Electronics",
    rating: "9.5/10 IMDB",
    duration: "Cyclic",
    date: "May, 2025",
    description:
      "Cathode and anode intercalation lattice simulation, electrolyte Li+ flux, Butler-Volmer electrochemical charge transfer, and SEI layer degradation.",
    previewUrl: "/simulations/lithium_ion_battery_dynamics/preview.html",
    jsxUrl: "/simulations/lithium_ion_battery_dynamics/LithiumIonBatterySimulation.jsx",
    promptFile: "samples/lithium_ion_battery_prompt.json",
    equations: [
      "j = j₀(exp(α_a Fη/RT) - exp(-α_c Fη/RT))",
      "N = -D·∇C + (zF/RT)D·C·E",
      "V_cell = E_ocv - i·R_int",
    ],
    keyParameters: [
      { name: "C-Rate", value: "1.0", unit: "C" },
      { name: "State of Charge", value: "68", unit: "%" },
      { name: "Electrolyte Temp", value: "25", unit: "°C" },
    ],
    accentColor: "#10b981",
  },
  {
    id: "indus_valley_3d",
    slug: "indus_valley_architecture_3d",
    title: "Mohenjo-daro 3D Citadel Architecture",
    subtitle: "Bronze Age Urban Hydrology & Three.js WebGL Reconstruction",
    category: "Archaeology",
    rating: "9.3/10 IMDB",
    duration: "3D Orbit",
    date: "February, 2025",
    description:
      "Interactive 3D Three.js reconstruction of the Great Bath, baked-brick masonry drainage systems, granary columns, and urban hydrology from 2600 BCE.",
    previewUrl: "/simulations/indus_valley_architecture_3d/preview.html",
    jsxUrl: "/simulations/indus_valley_architecture_3d/IndusValleySimulation.jsx",
    promptFile: "samples/indus_valley_architecture_3d_prompt.json",
    equations: [
      "V_bath = L × W × H (12m × 7m × 2.4m)",
      "Bitumen Seal Porosity ≈ 0.02%",
    ],
    keyParameters: [
      { name: "Water Level", value: "2.1", unit: "m" },
      { name: "Sun Altitude", value: "48", unit: "deg" },
      { name: "Drain Velocity", value: "0.8", unit: "m/s" },
    ],
    accentColor: "#f59e0b",
  },
  {
    id: "earth_gravity_tunnel",
    slug: "earth_gravity_tunnel",
    title: "Diametric Earth Gravity Tunnel Transit",
    subtitle: "Core Harmonic Oscillation & Shell Theorem Gravity",
    category: "Astrophysics",
    rating: "9.2/10 IMDB",
    duration: "42.2 min",
    date: "April, 2025",
    description:
      "Hypothetical evacuation tunnel drilled through Earth's center. Illustrates Newton's Shell Theorem with linear restoring gravity force and Coriolis deflection.",
    previewUrl: "/simulations/earth_gravity_tunnel/preview.html",
    jsxUrl: "/simulations/earth_gravity_tunnel/EarthGravityTunnelSimulation.jsx",
    promptFile: "samples/earth_tunnel_prompt.json",
    equations: [
      "g(r) = G·M_earth · (r / R³)",
      "ω = √(g₀ / R) ≈ 1.24 × 10⁻³ rad/s",
      "T = 2π / ω ≈ 42.2 min (half-period)",
    ],
    keyParameters: [
      { name: "Transit Half-Period", value: "42.2", unit: "min" },
      { name: "Maximum Core Speed", value: "7900", unit: "m/s" },
      { name: "Tunnel Damping", value: "0.00", unit: "ζ" },
    ],
    accentColor: "#ec4899",
  },
  {
    id: "neuroscience_stress_brain",
    slug: "neuroscience_stress_brain_anatomy",
    title: "Neurobiology of the HPA Stress Axis",
    subtitle: "Amygdala-PFC Feedback & Endocrine Cortisol Signaling",
    category: "Neuroscience",
    rating: "9.5/10 IMDB",
    duration: "Multi-path",
    date: "January, 2025",
    description:
      "Interactive neuro-anatomical model showing hypothalamic-pituitary-adrenal (HPA) axis trigger, amygdala hyperactivation, and prefrontal cortex down-regulation under acute stress.",
    previewUrl: "/simulations/neuroscience_stress_brain_anatomy/preview.html",
    jsxUrl: "/simulations/neuroscience_stress_brain_anatomy/NeuroscienceStressSimulation.jsx",
    promptFile: "samples/neuroscience_stress_brain_prompt.json",
    equations: [
      "d[CRH]/dt = k_amygdala - k_deg·[CRH] - k_cortisol·[PFC]",
      "[Cortisol]_steady = α·[ACTH] / (β + [ACTH])",
    ],
    keyParameters: [
      { name: "Stress Intensity", value: "75", unit: "%" },
      { name: "Cortisol Concentration", value: "28", unit: "μg/dL" },
      { name: "PFC Inhibition", value: "42", unit: "%" },
    ],
    accentColor: "#8b5cf6",
  },
  {
    id: "photosynthesis_kinetics",
    slug: "photosynthesis_limiting_factors",
    title: "Photosynthesis Limiting Factor Kinetics",
    subtitle: "Photon Capture, Rubisco Saturation & Heat Denaturation",
    category: "Biophysics",
    rating: "9.1/10 IMDB",
    duration: "Interactive",
    date: "March, 2025",
    description:
      "Multi-variable biochemical model of chloroplast light reactions and Calvin cycle. Demonstrates Blackman's Law of limiting factors across irradiance, CO2, and temperature.",
    previewUrl: "/simulations/photosynthesis_limiting_factors/preview.html",
    jsxUrl: "/simulations/photosynthesis_limiting_factors/PhotosynthesisSimulation.jsx",
    promptFile: "samples/photosynthesis_limiting_factors_prompt.json",
    equations: [
      "Rate = min(R_light, R_CO2, R_temp)",
      "v = (V_max · [CO₂]) / (K_m + [CO₂])",
      "Q₁₀ = (R₂ / R₁)^(10 / (T₂ - T₁))",
    ],
    keyParameters: [
      { name: "Photon Flux PAR", value: "850", unit: "μmol/m²s" },
      { name: "CO₂ Concentration", value: "420", unit: "ppm" },
      { name: "Leaf Temperature", value: "24", unit: "°C" },
    ],
    accentColor: "#22c55e",
  },
  {
    id: "usb_flash_nand",
    slug: "usb_flash_nand_memory",
    title: "3D NAND Floating Gate Flash Cell",
    subtitle: "Fowler-Nordheim Quantum Tunneling & Oxide Degradation",
    category: "Electronics",
    rating: "9.4/10 IMDB",
    duration: "Nanoseconds",
    date: "May, 2025",
    description:
      "Microelectronic physics of floating-gate MOSFET and charge-trap NAND flash. Shows Fowler-Nordheim electron tunneling under program/erase high voltage and oxide wear.",
    previewUrl: "/simulations/usb_flash_nand_memory/preview.html",
    jsxUrl: "/simulations/usb_flash_nand_memory/FlashMemorySimulation.jsx",
    promptFile: "samples/flash_memory_pendrive_prompt.json",
    equations: [
      "J_FN = A · E_ox² · exp(-B / E_ox)",
      "ΔV_th = -ΔQ_fg / C_ox",
      "Endurance_fail ∝ exp(E_a / kT)",
    ],
    keyParameters: [
      { name: "Program Gate Voltage", value: "18.5", unit: "V" },
      { name: "Tunnel Oxide Thickness", value: "8.2", unit: "nm" },
      { name: "P/E Cycle Wear", value: "1420", unit: "cycles" },
    ],
    accentColor: "#f97316",
  },
  {
    id: "war_stock_market",
    slug: "war_stock_market_impact",
    title: "Geopolitical Shock & Financial Market Dynamics",
    subtitle: "Defense, Energy, Gold & VIX Cross-Asset Propagation",
    category: "Economics",
    rating: "8.9/10 IMDB",
    duration: "Multi-asset",
    date: "April, 2025",
    description:
      "Quantitative macroeconomic shock model illustrating transmission of conflict events across defense primes, Brent crude supply risk, gold flight-to-safety, and VIX volatility.",
    previewUrl: "/simulations/war_stock_market_impact/preview.html",
    jsxUrl: "/simulations/war_stock_market_impact/WarStockMarketSimulation.jsx",
    promptFile: "samples/war_stock_market_impact_prompt.json",
    equations: [
      "r_i(t) = β_i · S(t) + ε_i",
      "VIX(t) = VIX₀ + γ · |dS/dt|",
      "P_oil(t) = P₀ · (1 + risk_premium)",
    ],
    keyParameters: [
      { name: "Shock Severity", value: "8.5", unit: "/10" },
      { name: "Crude Supply Disruption", value: "2.4", unit: "mbpd" },
      { name: "VIX Spurt", value: "+44", unit: "%" },
    ],
    accentColor: "#ef4444",
  },
  {
    id: "venturi_meter_flow",
    slug: "venturi_effect_bernoulli_principle",
    title: "Venturi Flowmeter Piezometric Manometry",
    subtitle: "Continuity, Venturi Choking & Head Loss Dynamics",
    category: "Fluid Dynamics",
    rating: "9.2/10 IMDB",
    duration: "High Flow",
    date: "February, 2025",
    description:
      "Differential piezometric height comparison across inlet, constriction throat, and diffuser recovery cone, demonstrating boundary layer detachment and discharge coefficients.",
    previewUrl: "/simulations/venturi_effect_bernoulli_principle/preview.html",
    jsxUrl: "/simulations/venturi_effect_bernoulli_principle/VenturiSimulation.jsx",
    promptFile: "samples/live_test_venturi_prompt.json",
    equations: [
      "Q = C_d · A₂ · √(2(P₁ - P₂) / (ρ(1 - (A₂/A₁)²)))",
      "Re = ρvd / μ",
    ],
    keyParameters: [
      { name: "Inlet Area A₁", value: "120", unit: "cm²" },
      { name: "Throat Area A₂", value: "35", unit: "cm²" },
      { name: "Discharge Coeff", value: "0.98", unit: "C_d" },
    ],
    accentColor: "#3b82f6",
  },
  {
    id: "crude_oil_distillation",
    slug: "crude_oil_distillation",
    title: "Crude Oil Fractional Distillation & Petroleum Derivatives",
    subtitle: "Hydrocarbon Boiling Point Separation & Column Tray Equilibrium",
    category: "Chemical Engineering",
    rating: "9.9/10 IMDB",
    duration: "60 FPS Interactive",
    date: "April, 2025",
    description:
      "Interactive 45-meter fractionating distillation column separating raw crude into LPG, petrol, naphtha, kerosene, diesel, fuel oils, and bitumen residue through continuous vapor-liquid tray condensation.",
    previewUrl: "/simulations/crude_oil_distillation/preview.html",
    jsxUrl: "/simulations/crude_oil_distillation/CrudeOilDistillationSimulation.jsx",
    promptFile: "samples/crude_oil_distillation_prompt.json",
    equations: [
      "P_i = x_i · P_i^{sat} (Raoult's Law)",
      "ln(P^{sat}) = -ΔH_{vap}/(RT) + C (Clausius-Clapeyron)",
      "F_{feed} = ∑ D_j + B_{bottoms} (Overall Mass Balance)",
    ],
    keyParameters: [
      { name: "Furnace Temp", value: "380", unit: "°C" },
      { name: "Feed Rate", value: "50,000", unit: "BPD" },
      { name: "Column Pressure", value: "1.2", unit: "atm" },
    ],
    accentColor: "#f59e0b",
  },
  {
    id: "kidney_nephron_filtration",
    slug: "human_kidney_nephron_function",
    title: "Human Kidney Nephron Filtration & Reabsorption",
    subtitle: "Glomerular Hemodynamics & Tubular Glucose Threshold",
    category: "Biophysics",
    rating: "9.7/10 IMDB",
    duration: "Interactive",
    date: "May, 2025",
    description:
      "Visualizing glomerular capillary hydrostatic pressure, net filtration pressure (NFP), and tubular transport maximum (Tm) glucose clearance across renal nephrons.",
    previewUrl: "/simulations/human_kidney_nephron_function/preview.html",
    jsxUrl: "/simulations/human_kidney_nephron_function/HumanKidneyNephronFunctionSimulation.jsx",
    promptFile: "samples/kidney_nephron_prompt.json",
    equations: [
      "NFP = P_gc - P_bc - π_gc",
      "GFR = K_f · NFP",
      "T_m = 375 mg/min (Glucose)",
    ],
    keyParameters: [
      { name: "Glomerular Pressure", value: "45", unit: "mmHg" },
      { name: "GFR", value: "125", unit: "mL/min" },
      { name: "Glucose Load", value: "180", unit: "mg/min" },
    ],
    accentColor: "#38bdf8",
  },
  {
    id: "stomach_acid_digestion",
    slug: "stomach_acid_digestion",
    title: "Stomach Gastric Acid Digestion & Enzyme Dynamics",
    subtitle: "Parietal HCl Secretion, Pepsin Activation & Proteolysis",
    category: "Biochemistry",
    rating: "9.8/10 IMDB",
    duration: "Interactive",
    date: "May, 2025",
    description:
      "Interactive biochemical simulation of parietal cell hydrochloric acid secretion, pepsinogen autolytic cleavage at pH < 3.0, gastric chyme proteolysis kinetics, and mucosal barrier defense.",
    previewUrl: "/simulations/stomach_acid_digestion/preview.html",
    jsxUrl: "/simulations/stomach_acid_digestion/StomachAcidDigestionSimulation.jsx",
    promptFile: "samples/stomach_acid_digestion_prompt.json",
    equations: [
      "pH = -log₁₀[H⁺]",
      "Pepsinogen + HCl → Active Pepsin",
      "v = (V_max · [S]) / (K_m + [S])",
    ],
    keyParameters: [
      { name: "Lumen pH", value: "1.8", unit: "pH" },
      { name: "HCl Output", value: "25", unit: "mmol/hr" },
      { name: "Pepsin Rate", value: "60", unit: "mg/hr" },
    ],
    accentColor: "#f59e0b",
  },
];
