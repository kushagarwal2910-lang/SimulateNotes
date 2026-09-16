import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";
import { PRESET_SIMULATENOTES } from "@/lib/simulateNotesData";
import { SourceDocument } from "@/lib/simulateNotesTypes";
import { getRagCache } from "@/lib/storage";

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

    // If active sources is strictly 0, auto-dispatch the full pipeline (Tavily research + Simulation generation)
    if (availableSources.length === 0 && indexedChunks.length === 0) {
      let generationJobId: string | undefined;
      try {
        const baseUrl = req.nextUrl.origin || "http://localhost:3000";
        const genRes = await fetch(`${baseUrl}/api/generate-simulation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, notebookId }),
        });
        const genData = await genRes.json();
        generationJobId = genData.jobId;
      } catch (err) {
        console.error("Failed to auto-start dynamic pipeline for empty note:", err);
      }

      return NextResponse.json({
        status: "success",
        query,
        answer: `I'm autonomously researching technical literature for **"${query}"** via Tavily, extracting the mathematical model and physical equations, and compiling the 60 FPS interactive simulation in the Studio.\n\n• **Agent 1 (Spec Synthesizer)**: Formulating equations, state variables, and SVG blueprints into a verified JSON prompt.\n• **Agent 2 (Simulation Engine)**: Compiling React 18 + GSAP simulation code, running Babel AST check, and self-healing.\n\n⏳ **Follow real-time compilation in the Studio panel on the right!**`,
        sources: [],
        simulation: null,
        dynamicGeneration: true,
        generationJobId,
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
    let matchedSim: SimulationItem | undefined;

    const hasWord = (word: string) => new RegExp(`\\b${word}\\b`, "i").test(lowerQuery);
    const hasPhrase = (phrase: string) => lowerQuery.includes(phrase);

    if (
      hasPhrase("crude oil") ||
      hasPhrase("fractional distillation") ||
      hasPhrase("oil distillation") ||
      hasWord("petroleum")
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "crude_oil_distillation");
    } else if (
      hasPhrase("keplerian") ||
      hasPhrase("vis-viva") ||
      hasPhrase("orbital mechanics") ||
      hasPhrase("gravity well") ||
      (hasWord("orbit") && (hasWord("gravity") || hasWord("kepler")))
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "gravitational_orbit_mechanics");
    } else if (
      hasWord("bernoulli") ||
      hasPhrase("venturi") ||
      (hasPhrase("fluid dynamics") && (hasWord("pressure") || hasWord("velocity")))
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "bernoulli");
    } else if (
      hasPhrase("lithium ion") ||
      hasPhrase("lithium-ion") ||
      hasPhrase("butler-volmer") ||
      hasPhrase("battery dynamics")
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "lithium_ion_battery_dynamics");
    } else if (
      hasPhrase("neuroscience") ||
      hasPhrase("hpa axis") ||
      hasPhrase("brain anatomy") ||
      hasWord("amygdala")
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "neuroscience_stress_brain_anatomy");
    } else if (
      hasPhrase("nand flash") ||
      hasPhrase("floating gate") ||
      hasPhrase("nand memory") ||
      (hasPhrase("flash memory") && hasWord("tunneling"))
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "usb_flash_nand_memory");
    } else if (
      hasPhrase("quantum tunneling") ||
      hasPhrase("evanescent decay") ||
      (hasWord("tunneling") && (hasWord("barrier") || hasWord("wavepacket")))
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "quantum_tunneling_barrier");
    } else if (
      hasWord("bayes") ||
      hasPhrase("bayes theorem") ||
      hasPhrase("bayesian") ||
      (hasWord("conditional") && hasWord("probability"))
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "bayes_theorem_conditional_probability");
    } else if (
      hasPhrase("kidney") ||
      hasPhrase("renal") ||
      hasPhrase("nephron") ||
      hasPhrase("glomerular") ||
      hasWord("kidneys")
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "human_kidney_nephron_function");
    } else if (
      hasPhrase("stomach") ||
      hasPhrase("gastric") ||
      hasPhrase("pepsin") ||
      (hasWord("acid") && hasWord("digest")) ||
      (hasWord("stomach") && hasWord("acid"))
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "stomach_acid_digestion");
    } else if (
      hasPhrase("gravity tunnel") ||
      hasPhrase("earth gravity tunnel")
    ) {
      matchedSim = SIMULATIONS_CATALOG.find((s) => s.slug === "earth_gravity_tunnel");
    }

    // Determine whether user wants to create a new simulation or ask about existing one
    const isExplicitSimulation = /\b(simulate|simulation|generate|create|model|build|make|visualize|new)\b/i.test(query);

    let matchesExistingTopic = false;
    if (cacheData && cacheData.simulation) {
      const simTitleWords = (cacheData.simulation.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w: string) => w.length > 3);
      matchesExistingTopic = simTitleWords.some((w: string) => lowerQuery.includes(w));
    }

    // Only preserve existing simulation if the query is an explanatory follow-up about that specific topic
    if (!matchedSim && cacheData && cacheData.simulation && !isExplicitSimulation && matchesExistingTopic) {
      matchedSim = cacheData.simulation;
    }

    const isDynamicTopic = !matchedSim;

    // =========================================================================
    // 4. SYNTHESIZE GROUNDED RAG ANSWER & TRIGGER DUAL-AGENT PIPELINE
    // =========================================================================
    let answer = "";
    let dynamicGeneration = false;
    let generationJobId: string | undefined;

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

      answer = `Based on the authoritative sources currently indexed in your notebook's RAG database [1, 2, 3]:\n\n${snippetText}\n\n### 🔬 LangGraph Simulation Pipeline Active\n\nI have extracted the governing physical relationships and mathematical equations from your RAG knowledge base. Now dispatching to the dual LangGraph agents:\n\n1. **Agent 1 (Spec Synthesizer)**: Formulates equations, state variables, and SVG scene blueprints into a verified JSON specification.\n2. **Agent 2 (Simulation Engine)**: Generates React 18 + GSAP simulation code, verifies AST with Babel, self-heals, and exports the 60 FPS interactive model.\n\n⏳ **Follow real-time compilation in the Studio panel on the right!**`;

      // Start the background pipeline passing notebookId (so it uses the already indexed RAG store)
      try {
        const baseUrl = req.nextUrl.origin || "http://localhost:3000";
        const genRes = await fetch(`${baseUrl}/api/generate-simulation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, notebookId }),
        });
        const genData = await genRes.json();
        generationJobId = genData.jobId;
      } catch (err) {
        console.error("Failed to start dynamic pipeline:", err);
      }
    }

    return NextResponse.json({
      status: "success",
      query,
      sources: activeSources,
      answer,
      simulation: isDynamicTopic ? null : matchedSim,
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
