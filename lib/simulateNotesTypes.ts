import { SimulationItem, SIMULATIONS_CATALOG } from "./simulationsData";

export interface SourceDocument {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  relevance: number; // e.g. 98 (%)
  chunks: number;
  category: string;
  simulationSlug?: string;
  dateAdded: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent_rag" | "agent_simulation";
  timestamp: string;
  content: string;
  citations?: number[]; // indices of sources [1, 2, ...]
  simulation?: SimulationItem;
  graphStep?: string;
  isExecuting?: boolean;
}

// Initial knowledge base pre-indexed for SimulateNotes
export const INITIAL_SOURCES: SourceDocument[] = [
  {
    id: "src-1",
    title: "Quantum Tunneling in Potential Barriers: Exact Analytical Transmission",
    url: "https://journals.aps.org/prb/abstract/10.1103/PhysRevB.quantum_tunneling",
    domain: "journals.aps.org",
    snippet: "Exact Schrödinger wavepacket solutions in finite rectangular potential energy barriers. Demonstrates exponential evanescent decay κ = √(2m(V₀ - E))/ħ and transmission coefficient T ≈ exp(-2κL).",
    relevance: 98,
    chunks: 14,
    category: "Quantum Mechanics",
    simulationSlug: "quantum_tunneling_barrier",
    dateAdded: "April 2025",
  },
  {
    id: "src-2",
    title: "Keplerian Two-Body Celestial Dynamics and Vis-Viva Velocity Equations",
    url: "https://arxiv.org/abs/2304.keplerian_orbital_mechanics",
    domain: "arxiv.org",
    snippet: "Orbital conservation laws, angular momentum invariance, and vis-viva equation v² = GM(2/r - 1/a). Details gravitational potential well gradients across varying eccentricities.",
    relevance: 95,
    chunks: 12,
    category: "Astrophysics",
    simulationSlug: "gravitational_orbit_mechanics",
    dateAdded: "March 2025",
  },
  {
    id: "src-3",
    title: "Hydrodynamic Pressure Gradients in Venturi Constriction Cones",
    url: "https://sciencedirect.com/science/article/pii/fluid_dynamics_bernoulli",
    domain: "sciencedirect.com",
    snippet: "Continuity equation A₁v₁ = A₂v₂ and Bernoulli energy conservation P₁ + ½ρv₁² = P₂ + ½ρv₂². Analytical calculation of differential manometer fluid heights and head loss.",
    relevance: 93,
    chunks: 16,
    category: "Fluid Dynamics",
    simulationSlug: "bernoulli",
    dateAdded: "April 2025",
  },
  {
    id: "src-4",
    title: "Electrochemical Kinetics of Lithium-Ion Phase Intercalation in Cathodes",
    url: "https://nature.com/articles/s41560-lithium_intercalation_transport",
    domain: "nature.com",
    snippet: "Butler-Volmer overpotential kinetics j = j₀(exp(α_a Fη/RT) - exp(-α_c Fη/RT)), Li+ ion diffusion across porous polymer separators, and solid electrolyte interphase (SEI) growth.",
    relevance: 94,
    chunks: 18,
    category: "Electrochemistry",
    simulationSlug: "lithium_ion_battery_dynamics",
    dateAdded: "May 2025",
  },
  {
    id: "src-5",
    title: "Fowler-Nordheim Quantum Tunneling in 3D NAND Floating Gate Memories",
    url: "https://ieeexplore.ieee.org/document/flash_memory_tunneling_nand",
    domain: "ieeexplore.ieee.org",
    snippet: "High-field electron injection J_FN = A·E_ox²·exp(-B/E_ox), floating gate trapped charge threshold voltage shifts ΔV_th, and dielectric stress-induced oxide leakage.",
    relevance: 92,
    chunks: 11,
    category: "Microelectronics",
    simulationSlug: "usb_flash_nand_memory",
    dateAdded: "May 2025",
  },
  {
    id: "src-6",
    title: "Shell Theorem and Simple Harmonic Motion in Planetary Gravity Tunnels",
    url: "https://aapt.scitation.org/doi/10.1119/earth_tunnel_gravity",
    domain: "scitation.org",
    snippet: "Internal gravitational field of uniform density spheres g(r) = G·M(r/R³). Yields a constant oscillation period T = 2π√(R/g₀) ≈ 84.3 min (transit time: 42.2 min) independent of planetary radius.",
    relevance: 91,
    chunks: 9,
    category: "Classical Mechanics",
    simulationSlug: "earth_gravity_tunnel",
    dateAdded: "April 2025",
  },
  {
    id: "src-7",
    title: "Neurobiology of the HPA Axis: Amygdala and PFC Cortisol Biofeedback",
    url: "https://ncbi.nlm.nih.gov/pmc/articles/neuroscience_stress_hpa",
    domain: "ncbi.nlm.nih.gov",
    snippet: "Endocrine signaling cascade: Corticotropin-releasing hormone (CRH) from hypothalamus induces ACTH from pituitary, triggering adrenal cortisol release with negative biofeedback.",
    relevance: 96,
    chunks: 20,
    category: "Neuroscience",
    simulationSlug: "neuroscience_stress_brain_anatomy",
    dateAdded: "January 2025",
  },
  {
    id: "src-8",
    title: "Blackman Limiting Factors & Rubisco Enzyme Saturation Kinetics",
    url: "https://annualreviews.org/doi/plant_biophysics_photosynthesis",
    domain: "annualreviews.org",
    snippet: "Multi-parameter photosynthetic rate limits min(R_light, R_CO2, R_temp). Light-dependent photon flux saturation and temperature denaturation activation energies.",
    relevance: 89,
    chunks: 13,
    category: "Biophysics",
    simulationSlug: "photosynthesis_limiting_factors",
    dateAdded: "March 2025",
  },
];
