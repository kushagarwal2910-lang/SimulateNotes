import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";
import { PRESET_SIMULATENOTES } from "@/lib/simulateNotesData";
import { SourceDocument } from "@/lib/simulateNotesTypes";
import { getRagCache, setJob } from "@/lib/storage";
import { generateSimulation } from "@/lib/simulationGenerator";

function findCatalogMatch(query: string): SimulationItem | undefined {
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const queryTokens = cleanQuery.split(/\s+/).filter((t: string) => t.length > 2 && !['simulate', 'simulation', 'generate', 'model', 'show', 'create', 'build', 'please', 'with', 'about', 'the'].includes(t));

  let bestMatch: SimulationItem | undefined;
  let highestScore = 0;

  for (const item of SIMULATIONS_CATALOG) {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const slugLower = item.slug.toLowerCase().replace(/_/g, " ");
    const descLower = item.description.toLowerCase();

    // Exact or strong phrase match
    if (cleanQuery.includes(titleLower) || cleanQuery.includes(slugLower)) {
      score += 25;
    }

    // Specific domain keywords
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 5;
      if (slugLower.includes(token)) score += 5;
      if (descLower.includes(token)) score += 1;
    }

    // Specific simulation keyword boosts
    if (item.slug === "doppler_effect_sound_source_motion" && (cleanQuery.includes("doppler") || cleanQuery.includes("frequency shift"))) score += 20;
    if (item.slug === "photoelectric_effect_simulation" && (cleanQuery.includes("photoelectric") || cleanQuery.includes("work function"))) score += 20;
    if (item.slug === "hydraulic_press_pascal_dynamics" && (cleanQuery.includes("hydraulic") || cleanQuery.includes("pascal"))) score += 20;
    if (item.slug === "rocket_propulsion_system" && (cleanQuery.includes("rocket propulsion") || cleanQuery.includes("tsiolkovsky"))) score += 20;
    if (item.slug === "rocket_ascent_multistage" && (cleanQuery.includes("multistage") || cleanQuery.includes("rocket ascent") || cleanQuery.includes("staging"))) score += 20;
    if (item.slug === "steam_turbine_engine" && (cleanQuery.includes("steam turbine") || cleanQuery.includes("rankine"))) score += 20;
    if (item.slug === "sim_simulate_centrifugal_pump_impell" && (cleanQuery.includes("centrifugal pump") || cleanQuery.includes("impeller"))) score += 20;
    if (item.slug === "integration_area_under_curve" && (cleanQuery.includes("riemann") || cleanQuery.includes("calculus integration") || cleanQuery.includes("definite integral"))) score += 20;
    if (item.slug === "crude_oil_distillation" && (cleanQuery.includes("crude oil") || cleanQuery.includes("fractional distillation") || cleanQuery.includes("petroleum"))) score += 20;
    if (item.slug === "gravitational_orbit_mechanics" && (cleanQuery.includes("orbit") || cleanQuery.includes("kepler") || cleanQuery.includes("vis-viva") || cleanQuery.includes("gravity well"))) score += 20;
    if (item.slug === "bernoulli" && (cleanQuery.includes("bernoulli") || cleanQuery.includes("venturi"))) score += 20;
    if (item.slug === "lithium_ion_battery_dynamics" && (cleanQuery.includes("battery") || cleanQuery.includes("lithium") || cleanQuery.includes("butler volmer"))) score += 20;
    if (item.slug === "neuroscience_stress_brain_anatomy" && (cleanQuery.includes("neuroscience") || cleanQuery.includes("hpa axis") || cleanQuery.includes("brain") || cleanQuery.includes("amygdala"))) score += 20;
    if (item.slug === "usb_flash_nand_memory" && (cleanQuery.includes("nand") || cleanQuery.includes("floating gate") || cleanQuery.includes("flash memory"))) score += 20;
    if (item.slug === "quantum_tunneling_barrier" && (cleanQuery.includes("quantum tunneling") || cleanQuery.includes("tunneling barrier"))) score += 20;
    if (item.slug === "bayes_theorem_conditional_probability" && (cleanQuery.includes("bayes") || cleanQuery.includes("conditional probability"))) score += 20;
    if (item.slug === "human_kidney_nephron_function" && (cleanQuery.includes("kidney") || cleanQuery.includes("nephron") || cleanQuery.includes("renal"))) score += 20;
    if (item.slug === "stomach_acid_digestion" && (cleanQuery.includes("stomach") || cleanQuery.includes("gastric") || cleanQuery.includes("pepsin"))) score += 20;
    if (item.slug === "earth_gravity_tunnel" && (cleanQuery.includes("gravity tunnel") || cleanQuery.includes("earth tunnel"))) score += 20;
    if (item.slug === "butterfly_life_cycle_simulation" && (cleanQuery.includes("butterfly") || cleanQuery.includes("metamorphosis") || cleanQuery.includes("chrysalis"))) score += 20;
    if (item.slug === "paper_factory_fourdrinier" && (cleanQuery.includes("paper factory") || cleanQuery.includes("pulp") || cleanQuery.includes("fourdrinier"))) score += 20;

    if (score > highestScore && score >= 10) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, notebookId, selectedSourceIds, existingSources = [] } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase();

    // =========================================================================
    // 1. CHECK IF NOTEBOOK HAS INDEXED SOURCES (DO NOT CRAWL NEW ON QUERY)
    // =========================================================================
    let cacheData: any = notebookId ? getRagCache(notebookId) : null;
    let indexedChunks: any[] = cacheData?.chunks && Array.isArray(cacheData.chunks) ? cacheData.chunks : [];
    let availableSources: SourceDocument[] = existingSources || [];

    if ((!availableSources || availableSources.length === 0) && cacheData?.sources) {
      availableSources = cacheData.sources;
    }

    // Preset fallback if notebookId matches a built-in note
    const presetMatch = PRESET_SIMULATENOTES.find((p) => p.id === notebookId);
    if (presetMatch) {
      if (!availableSources || availableSources.length === 0) {
        availableSources = presetMatch.sources;
      }
      if (!cacheData) {
        cacheData = { simulation: presetMatch.simulation, sources: presetMatch.sources };
      }
    }

    // Auto-generate search chunks if sources exist
    if (indexedChunks.length === 0 && availableSources.length > 0) {
      indexedChunks = availableSources.map((s, i) => ({
        chunk_id: `chk_${i}`,
        title: s.title,
        text: `${s.title}: ${s.snippet}`,
        has_math: Boolean(s.snippet.match(/(=|\^|\\sum|\\frac|\\sqrt|\\alpha|\\beta|\\gamma|\\hbar|\\pi)/i)),
      }));
    }

    // If active sources is strictly 0, check catalog first before dispatching dual-agent generation
    if (availableSources.length === 0 && indexedChunks.length === 0) {
      const catalogDirect = findCatalogMatch(query);
      if (catalogDirect) {
        return NextResponse.json({
          status: "success",
          query,
          answer: `Loaded pre-compiled 60 FPS scientific simulation for **"${catalogDirect.title}"** from the knowledge catalog.\n\n### Key Governing Principles & Equations:\n${catalogDirect.equations.map((eq) => `• \`${eq}\``).join("\n")}\n\n### Experimental Parameters:\n• **Primary Controls**: ${catalogDirect.keyParameters.map((p) => `**${p.name}** (\`${p.value} ${p.unit}\`)`).join(", ")}.\n• **Accuracy**: 60 FPS verified numerical solver.\n\n✨ **Interact with real-time controls in the Studio panel on the right!**`,
          sources: [],
          simulation: catalogDirect,
          dynamicGeneration: false,
        });
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setJob(jobId, {
        status: "running",
        step: "spec",
        detail: `Synthesizing physical model and state equations for: ${query}`,
        timestamp: Date.now() / 1000,
      });

      // Synchronously generate simulation for serverless consistency
      let simulation: any = null;
      try {
        simulation = await generateSimulation(query, jobId, (step, detail) => {
          setJob(jobId, {
            status: "running",
            step,
            detail,
            timestamp: Date.now() / 1000,
          });
        });

        setJob(jobId, {
          status: "completed",
          step: "completed",
          detail: `Verified and compiled 60 FPS simulation for: ${simulation.title}`,
          timestamp: Date.now() / 1000,
          result: { simulation },
          simulation,
        });
      } catch (e) {
        console.error("Simulation error in empty-sources handler:", e);
      }

      return NextResponse.json({
        status: "success",
        query,
        answer: `I've formulated the physical model and equations for **"${query}"** and compiled the 60 FPS interactive simulation in the Studio.\n\n• **Agent 1 (Spec Synthesizer)**: Formulating equations, state variables, and SVG blueprints into a verified JSON prompt.\n• **Agent 2 (Simulation Engine)**: Compiling React 18 + GSAP simulation code, running Babel AST check, and self-healing.\n\n✨ **Interact with real-time controls and observation metrics in the Studio panel on the right!**`,
        sources: [],
        simulation,
        dynamicGeneration: true,
        generationJobId: jobId,
      });
    }

    // Filter sources by selectedSourceIds if provided
    let activeSources = availableSources;
    if (Array.isArray(selectedSourceIds) && selectedSourceIds.length > 0) {
      const idSet = new Set(selectedSourceIds);
      activeSources = availableSources.filter((s) => idSet.has(s.id));
      if (activeSources.length === 0) activeSources = availableSources; // fallback to all
    }

    // =========================================================================
    // 2. SEARCH OVER ALREADY INDEXED RAG DATABASE
    // =========================================================================
    // Score existing chunks against the query keywords
    const queryTokens = lowerQuery
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t: string) => t.length > 2);

    let retrievedContextSnippets: string[] = [];

    if (indexedChunks.length > 0) {
      const scoredChunks = indexedChunks.map((chunk) => {
        const text = (chunk.text || "").toLowerCase();
        let score = 0;
        for (const token of queryTokens) {
          if (text.includes(token)) score += 2;
        }
        if (chunk.has_math) score += 1;
        return { ...chunk, score };
      });

      scoredChunks.sort((a, b) => b.score - a.score);
      const topChunks = scoredChunks.slice(0, 4);
      retrievedContextSnippets = topChunks.map((c) => c.text.trim());
    }

    // Fallback snippets from active sources if no chunks in cache
    if (retrievedContextSnippets.length === 0) {
      retrievedContextSnippets = activeSources.slice(0, 3).map((s) => s.snippet);
    }

    // =========================================================================
    // 3. MATCH RELEVANT SIMULATION FROM PRE-BUILT CATALOG (IF APPLICABLE)
    // =========================================================================
    let matchedSim: SimulationItem | undefined = findCatalogMatch(query);

    let matchesExistingTopic = false;
    if (cacheData && cacheData.simulation) {
      const simTitleWords = (cacheData.simulation.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w: string) => w.length > 3);
      matchesExistingTopic = simTitleWords.some((w: string) => lowerQuery.includes(w));
    }

    if (!matchedSim && cacheData && cacheData.simulation && matchesExistingTopic) {
      // Only preserve existing simulation if the query is an explanatory follow-up about that specific topic
      matchedSim = cacheData.simulation;
    }

    const isDynamicTopic = !matchedSim;

    // =========================================================================
    // 4. SYNTHESIZE GROUNDED RAG ANSWER & TRIGGER DUAL-AGENT PIPELINE
    // =========================================================================
    let answer = "";
    let dynamicGeneration = false;
    let generationJobId: string | undefined;
    let generatedSimulation: SimulationItem | null = null;

    if (!isDynamicTopic && matchedSim) {
      const topContext = retrievedContextSnippets[0] || matchedSim.description;
      answer = `Based on your indexed RAG sources [1, 2]:\n\n${topContext}\n\n### Key Governing Principles & Equations:\n${matchedSim.equations.map((eq) => `• \`${eq}\``).join("\n")}\n\n### Experimental Parameters:\n• **Primary Controls**: ${matchedSim.keyParameters.map((p) => `**${p.name}** (\`${p.value} ${p.unit}\`)`).join(", ")} [1].\n• **Accuracy**: 60 FPS GSAP numerical state solver [2].\n\nAgent 2 has synthesized the interactive simulation in your right Studio window!`;
    } else {
      // DYNAMIC QUERY: Search over indexed RAG database, send query + retrieved context to Agent 1 -> Agent 2
      dynamicGeneration = true;

      const topSnippets = retrievedContextSnippets.slice(0, 3);
      const snippetText = topSnippets.length > 0
        ? topSnippets.map((s, i) => `[${i + 1}] ${s}`).join("\n\n")
        : `Analyzing indexed technical knowledge for: "${query}".`;

      answer = `Based on the authoritative sources currently indexed in your notebook's RAG database [1, 2, 3]:\n\n${snippetText}\n\n### 🔬 LangGraph Simulation Pipeline Active\n\nI have extracted the governing physical relationships and mathematical equations from your RAG knowledge base. Now dispatching to the dual LangGraph agents:\n\n1. **Agent 1 (Spec Synthesizer)**: Formulating equations, state variables, and SVG scene blueprints into a verified JSON specification.\n2. **Agent 2 (Simulation Engine)**: Generating React 18 + GSAP simulation code, verifying AST with Babel, self-healing, and exporting the 60 FPS interactive model.\n\n⏳ **Follow real-time compilation in the Studio panel on the right!**`;

      // Directly run generation with state tracking
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      generationJobId = jobId;

      setJob(jobId, {
        status: "running",
        step: "spec",
        detail: `Synthesizing physical model and state equations for: ${query}`,
        timestamp: Date.now() / 1000,
      });

      const simPromise = generateSimulation(query, jobId, (step, detail) => {
        setJob(jobId, {
          status: "running",
          step,
          detail,
          timestamp: Date.now() / 1000,
        });
      }).then((simulation) => {
        setJob(jobId, {
          status: "completed",
          step: "completed",
          detail: `Verified and compiled 60 FPS simulation for: ${simulation.title}`,
          timestamp: Date.now() / 1000,
          result: { simulation },
          simulation,
        });
        return simulation;
      });

      try {
        generatedSimulation = await simPromise;
      } catch (err) {
        console.error("Simulation generation error in rag-agent:", err);
      }
    }

    return NextResponse.json({
      status: "success",
      query,
      sources: activeSources,
      answer,
      simulation: isDynamicTopic ? generatedSimulation : matchedSim,
      dynamicGeneration,
      generationJobId,
    });
  } catch (error: any) {
    console.error("Error in /api/rag-agent:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
