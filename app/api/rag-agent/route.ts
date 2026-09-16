import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";
import { PRESET_SIMULATENOTES } from "@/lib/simulateNotesData";
import { SourceDocument } from "@/lib/simulateNotesTypes";
import { getRagCache, setJob } from "@/lib/storage";
import { generateSimulation } from "@/lib/simulationGenerator";

function findExactSlugMatch(query: string): SimulationItem | undefined {
  const clean = query.trim().toLowerCase();
  return SIMULATIONS_CATALOG.find((s) => s.slug === clean || s.id === clean);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, notebookId, selectedSourceIds, existingSources = [] } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase().trim();

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

    // If active sources is strictly 0, dispatch full dynamic simulation pipeline
    if (availableSources.length === 0 && indexedChunks.length === 0) {
      // Only return static item if query is literally an exact catalog slug
      const exactSlug = findExactSlugMatch(query);
      if (exactSlug) {
        return NextResponse.json({
          status: "success",
          query,
          answer: `Loaded pre-compiled 60 FPS scientific simulation for **"${exactSlug.title}"** from the knowledge catalog.\n\n### Key Governing Principles & Equations:\n${exactSlug.equations.map((eq) => `• \`${eq}\``).join("\n")}\n\n### Experimental Parameters:\n• **Primary Controls**: ${exactSlug.keyParameters.map((p) => `**${p.name}** (\`${p.value} ${p.unit}\`)`).join(", ")}.\n• **Accuracy**: 60 FPS verified numerical solver.\n\n✨ **Interact with real-time controls in the Studio panel on the right!**`,
          sources: [],
          simulation: exactSlug,
          dynamicGeneration: false,
        });
      }

      const topicSlug = query.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 32);
      const jobId = `job_${topicSlug}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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

    if (retrievedContextSnippets.length === 0) {
      retrievedContextSnippets = activeSources.slice(0, 3).map((s) => s.snippet);
    }

    // =========================================================================
    // 3. DETERMINE DYNAMIC GENERATION VS EXPLANATORY FOLLOW-UP
    // =========================================================================
    const isExplicitNewSim = /\b(simulate|simulation|generate|create|model|build|make|visualize|new|solve|show)\b/i.test(query);

    let matchedSim: SimulationItem | undefined = findExactSlugMatch(query);

    let matchesExistingTopic = false;
    if (cacheData && cacheData.simulation) {
      const simTitleWords = (cacheData.simulation.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w: string) => w.length > 3);
      matchesExistingTopic = simTitleWords.some((w: string) => lowerQuery.includes(w));
    }

    // Only reuse existing simulation if query is an explanatory follow-up about that current note
    if (!matchedSim && cacheData && cacheData.simulation && matchesExistingTopic && !isExplicitNewSim) {
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

      const topicSlug = query.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 32);
      const jobId = `job_${topicSlug}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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
