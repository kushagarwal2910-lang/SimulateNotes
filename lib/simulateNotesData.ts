import { SourceDocument, ChatMessage, INITIAL_SOURCES } from "./simulateNotesTypes";
import { SIMULATIONS_CATALOG, SimulationItem } from "./simulationsData";

export interface SimulateNote {
  id: string;
  title: string;
  description: string;
  date: string;
  sources: SourceDocument[];
  simulation: SimulationItem | null;
  messages: ChatMessage[];
}

// Backwards compatibility alias
export type Notebook = SimulateNote;

// Safe slug-based simulation lookup (immune to array index shifts)
export function getSimulationBySlug(slug: string): SimulationItem | null {
  return SIMULATIONS_CATALOG.find((s) => s.slug === slug) || null;
}

export const PRESET_SIMULATENOTES: SimulateNote[] = [
  {
    id: "sn-quantum-tunneling",
    title: "Quantum Tunneling & Wavepacket Dynamics",
    description: "Finite rectangular potential energy barrier penetration, evanescent wave decay, and mass-dependent transmission.",
    date: "April 14, 2025",
    sources: [
      INITIAL_SOURCES[0], // Quantum Tunneling
      {
        id: "src-q2",
        title: "Scanning Tunneling Microscopy: Exponential Distance Sensitivity",
        url: "https://nature.com/articles/stm_tunneling_gap",
        domain: "nature.com",
        snippet: "Atomic resolution imaging based on vacuum tunneling current I proportional to exp(-2 kappa d). A 0.1 nm change in barrier separation induces a tenfold change in tunneling probability.",
        relevance: 96,
        chunks: 12,
        category: "Quantum Mechanics",
        simulationSlug: "quantum_tunneling_barrier",
        dateAdded: "April 2025",
      },
      {
        id: "src-q3",
        title: "WKB Approximation in Non-Uniform Potential Barriers",
        url: "https://journals.aps.org/pr/abstract/wkb_barrier_approximation",
        domain: "journals.aps.org",
        snippet: "Semiclassical WKB transmission integral T ≈ exp(-2 integral kappa(x) dx). Validates wave matching across piecewise continuous boundary regions I, II, and III.",
        relevance: 93,
        chunks: 15,
        category: "Quantum Mechanics",
        simulationSlug: "quantum_tunneling_barrier",
        dateAdded: "April 2025",
      },
    ],
    simulation: getSimulationBySlug("quantum_tunneling_barrier"),
    messages: [
      {
        id: "m-q-1",
        role: "agent_rag",
        timestamp: "10:00 AM",
        content: "Welcome to the **Quantum Tunneling & Wavepacket Dynamics** SimulateNote.\n\nI have indexed 3 peer-reviewed sources on Schrödinger barrier penetration [1, 2, 3]. Ask any question, or test parameter variations in the Studio.",
        citations: [1, 2, 3],
      },
    ],
  },
  {
    id: "sn-keplerian-orbits",
    title: "Keplerian Gravitational Orbital Dynamics",
    description: "Vis-viva energy conservation, angular momentum invariance, and planetary orbital eccentricity mechanics.",
    date: "March 28, 2025",
    sources: [
      INITIAL_SOURCES[1], // Keplerian Orbits
      {
        id: "src-o2",
        title: "Celestial Mechanics and Two-Body Gravitational Potentials",
        url: "https://arxiv.org/abs/2305.celestial_mechanics_twobody",
        domain: "arxiv.org",
        snippet: "Gravitational force F = G(m1 m2)/r^2 and vis-viva equation v^2 = GM(2/r - 1/a). Solves velocity vectors at periapsis and apoapsis.",
        relevance: 95,
        chunks: 14,
        category: "Astrophysics",
        simulationSlug: "gravitational_orbit_mechanics",
        dateAdded: "March 2025",
      },
    ],
    simulation: getSimulationBySlug("gravitational_orbit_mechanics"),
    messages: [
      {
        id: "m-o-1",
        role: "agent_rag",
        timestamp: "09:30 AM",
        content: "This SimulateNote contains research on **Keplerian Two-Body Celestial Mechanics** [1, 2]. You can explore orbital velocity vectors and eccentricity in the Studio.",
        citations: [1, 2],
      },
    ],
  },
  {
    id: "sn-bernoulli-flow",
    title: "Bernoulli & Venturi Hydrodynamic Flow",
    description: "Fluid streamline continuity, constricted pipe velocity acceleration, and static pressure manometry drops.",
    date: "April 02, 2025",
    sources: [
      INITIAL_SOURCES[2], // Bernoulli
      {
        id: "src-b2",
        title: "Differential Piezometer Heads in Venturi Tubes",
        url: "https://sciencedirect.com/science/article/venturi_head_loss",
        domain: "sciencedirect.com",
        snippet: "Inlet vs throat pressure difference delta P = 0.5 rho (v2^2 - v1^2). Derivation of mass conservation flow continuity and piezometric fluid heights.",
        relevance: 94,
        chunks: 11,
        category: "Fluid Dynamics",
        simulationSlug: "bernoulli",
        dateAdded: "April 2025",
      },
    ],
    simulation: getSimulationBySlug("bernoulli"),
    messages: [
      {
        id: "m-b-1",
        role: "agent_rag",
        timestamp: "11:15 AM",
        content: "Grounded in fluid mechanics research [1, 2]. The Venturi simulation in your Studio reflects continuous hydrodynamic continuity.",
        citations: [1, 2],
      },
    ],
  },
  {
    id: "sn-lithium-battery",
    title: "Lithium-Ion Intercalation Electrochemistry",
    description: "Cathode and anode intercalation kinetics, Butler-Volmer overpotentials, and SEI layer degradation.",
    date: "May 10, 2025",
    sources: [INITIAL_SOURCES[3]], // Battery
    simulation: getSimulationBySlug("lithium_ion_battery_dynamics"),
    messages: [
      {
        id: "m-l-1",
        role: "agent_rag",
        timestamp: "02:20 PM",
        content: "SimulateNote initialized with electrochemistry sources [1]. Ask questions about C-rates or view ion intercalation live in the Studio.",
        citations: [1],
      },
    ],
  },
  {
    id: "sn-nand-flash",
    title: "3D NAND Floating Gate Flash Physics",
    description: "Fowler-Nordheim quantum tunneling electron injection, threshold voltage shifts, and oxide wear.",
    date: "May 04, 2025",
    sources: [INITIAL_SOURCES[4]], // NAND
    simulation: getSimulationBySlug("usb_flash_nand_memory"),
    messages: [
      {
        id: "m-n-1",
        role: "agent_rag",
        timestamp: "03:45 PM",
        content: "Indexed microelectronics research on Fowler-Nordheim high-field electron tunneling [1].",
        citations: [1],
      },
    ],
  },
  {
    id: "sn-earth-tunnel",
    title: "Planetary Earth Core Gravity Tunnel",
    description: "Newtonian Shell Theorem, harmonic oscillatory transit through planetary core, and 42.2 min half-period.",
    date: "April 18, 2025",
    sources: [INITIAL_SOURCES[5]], // Earth Tunnel
    simulation: getSimulationBySlug("earth_gravity_tunnel"),
    messages: [
      {
        id: "m-e-1",
        role: "agent_rag",
        timestamp: "01:05 PM",
        content: "Grounded in internal planetary gravity literature [1]. Transit times are invariant of planet radius under constant density assumptions.",
        citations: [1],
      },
    ],
  },
  {
    id: "sn-crude-oil",
    title: "Crude Oil Refining & Fractional Distillation",
    description: "Multi-component hydrocarbon phase equilibrium, bubble-cap tray condensation, and continuous thermal gradient separation.",
    date: "May 12, 2025",
    sources: [
      {
        id: "src-co-1",
        title: "Fractional Distillation of Petroleum Hydrocarbons - Energy Education",
        url: "https://energyeducation.ca/encyclopedia/Fractional_distillation",
        domain: "energyeducation.ca",
        snippet: "Fractional distillation separates crude oil hydrocarbons by boiling point in vertical fractionating columns (380°C base to 25°C top). Products: LPG, petrol, naphtha, kerosene, diesel, and bitumen.",
        relevance: 98,
        chunks: 14,
        category: "Chemical Engineering",
        simulationSlug: "crude_oil_distillation",
        dateAdded: "May 2025",
      },
      {
        id: "src-co-2",
        title: "Thermodynamics of Vapor-Liquid Equilibrium in Multi-Component Distillation",
        url: "https://en.wikipedia.org/wiki/Fractional_distillation",
        domain: "wikipedia.org",
        snippet: "Separation governed by Raoult's Law (P_i = x_i * P_i_sat) and relative volatility. Rising vapor cools at each perforated tray level.",
        relevance: 95,
        chunks: 12,
        category: "Thermodynamics",
        simulationSlug: "crude_oil_distillation",
        dateAdded: "May 2025",
      },
    ],
    simulation: getSimulationBySlug("crude_oil_distillation"),
    messages: [
      {
        id: "m-co-1",
        role: "agent_rag",
        timestamp: "12:00 PM",
        content: "Indexed authoritative petroleum refining literature [1, 2]. You can adjust furnace temperature and crude feed in the Studio to observe yield curves.",
        citations: [1, 2],
      },
    ],
  },
  {
    id: "sn-bayes-probability",
    title: "Bayes' Theorem: Prior to Posterior Updating",
    description: "Conditional probability normalization, evidence likelihood weighting, and Bayesian inference mathematics.",
    date: "May 15, 2025",
    sources: [
      {
        id: "src-b-1",
        title: "Bayes' Theorem and Conditional Probability Fundamentals",
        url: "https://en.wikipedia.org/wiki/Bayes%27_theorem",
        domain: "wikipedia.org",
        snippet: "P(A|B) = [P(B|A) * P(A)] / P(B). Quantifies rational belief updating given new empirical evidence.",
        relevance: 99,
        chunks: 10,
        category: "Mathematics / Probability",
        simulationSlug: "bayes_theorem_conditional_probability",
        dateAdded: "May 2025",
      },
    ],
    simulation: getSimulationBySlug("bayes_theorem_conditional_probability"),
    messages: [
      {
        id: "m-bp-1",
        role: "agent_rag",
        timestamp: "02:40 PM",
        content: "Grounded in Bayesian probability theory [1]. Explore dynamic evidence marbles and posterior convergence in the Studio.",
        citations: [1],
      },
    ],
  },
];

// Backwards compatibility export
export const PRESET_NOTEBOOKS = PRESET_SIMULATENOTES;
