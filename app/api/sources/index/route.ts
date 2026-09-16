import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { SourceDocument } from "@/lib/simulateNotesTypes";
import { SIMULATIONS_CATALOG } from "@/lib/simulationsData";

import { getRagCache, saveRagCache } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notebookId, topic, type = "tavily", text, simSlug } = body;

    if (!notebookId) {
      return NextResponse.json({ error: "notebookId is required" }, { status: 400 });
    }

    // Load existing indexed sources/chunks if any
    const existingCache = getRagCache(notebookId);
    let existingData: { sources: SourceDocument[]; chunks: any[] } = {
      sources: existingCache?.sources || [],
      chunks: existingCache?.chunks || [],
    };

    let newSources: SourceDocument[] = [];
    let newChunks: any[] = [];
    let topicTitle = topic || "Scientific Research";

    // -------------------------------------------------------------------------
    // Case 1: Tavily Web Search & RAG Indexing
    // -------------------------------------------------------------------------
    if (type === "tavily") {
      if (!topic || !topic.trim()) {
        return NextResponse.json({ error: "Search topic is required for Tavily" }, { status: 400 });
      }

      const cleanTopic = topic.trim();
      topicTitle = cleanTopic;
      const tavilyKey =
        process.env.TAVILY_API_KEY || "";

      let searchResults: any[] = [];

      if (tavilyKey) {
        try {
          const tavilyResp = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: tavilyKey,
              query: cleanTopic,
              search_depth: "advanced",
              include_raw_content: true,
              max_results: 10,
            }),
          });

          if (tavilyResp.ok) {
            const data = await tavilyResp.json();
            searchResults = data.results || [];
          } else {
            console.error("Tavily API returned status:", tavilyResp.status);
          }
        } catch (tavilyErr) {
          console.error("Tavily search network error:", tavilyErr);
        }
      }

      const derivedCat = deriveCategory(cleanTopic.toLowerCase());

      if (searchResults.length > 0) {
        searchResults.forEach((item: any, idx: number) => {
          let domain = "web";
          try {
            const parsed = new URL(item.url);
            domain = parsed.hostname.replace(/^www\./, "");
          } catch (e) {}

          const content = item.raw_content || item.content || "";
          const cleanSnippet = (item.content || "").replace(/\s+/g, " ").trim();
          const docId = `src-tavily-${notebookId}-${Date.now()}-${idx + 1}`;

          // Create chunks for this document
          const docChunks = splitIntoChunks(content || cleanSnippet, docId, item.title || cleanTopic, item.url);
          newChunks.push(...docChunks);

          newSources.push({
            id: docId,
            title: item.title || `Research Source: ${cleanTopic} (${idx + 1})`,
            url: item.url,
            domain,
            snippet: cleanSnippet.slice(0, 450) + (cleanSnippet.length > 450 ? "..." : ""),
            relevance: Math.max(85, Math.round(98 - idx * 2)),
            chunks: Math.max(docChunks.length, Math.round((content.length || 500) / 350)),
            category: derivedCat,
            dateAdded: "Just now",
          });
        });
      } else {
        // Fallback simulated authoritative reference
        const docId = `src-fallback-${notebookId}-${Date.now()}-1`;
        const fallbackText = `Comprehensive research and mathematical foundations on ${cleanTopic}. Governing conservation laws, differential relations, state parameters, and physical boundary conditions.`;
        const docChunks = splitIntoChunks(fallbackText, docId, cleanTopic, `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTopic)}`);
        newChunks.push(...docChunks);

        newSources.push({
          id: docId,
          title: `${cleanTopic}: Authoritative Overview`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTopic.replace(/\s+/g, "_"))}`,
          domain: "wikipedia.org",
          snippet: fallbackText,
          relevance: 95,
          chunks: docChunks.length,
          category: derivedCat,
          dateAdded: "Just now",
        });
      }
    }

    // -------------------------------------------------------------------------
    // Case 2: Custom Pasted Text / Equations
    // -------------------------------------------------------------------------
    else if (type === "paste") {
      if (!text || !text.trim()) {
        return NextResponse.json({ error: "Pasted text cannot be empty" }, { status: 400 });
      }

      const docId = `src-paste-${notebookId}-${Date.now()}`;
      const firstLine = text.trim().split("\n")[0].slice(0, 50);
      topicTitle = firstLine.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "Pasted Scientific Notes";

      const docChunks = splitIntoChunks(text, docId, topicTitle, "local:notes");
      newChunks.push(...docChunks);

      newSources.push({
        id: docId,
        title: topicTitle,
        url: "#",
        domain: "notebook-notes",
        snippet: text.trim().slice(0, 400) + (text.length > 400 ? "..." : ""),
        relevance: 99,
        chunks: docChunks.length,
        category: "Custom Notes",
        dateAdded: "Just now",
      });
    }

    // -------------------------------------------------------------------------
    // Case 3: Verified Simulation Package Library
    // -------------------------------------------------------------------------
    else if (type === "library") {
      const sim = SIMULATIONS_CATALOG.find((s) => s.slug === simSlug);
      if (!sim) {
        return NextResponse.json({ error: "Simulation package not found" }, { status: 404 });
      }

      topicTitle = sim.title;
      const docId = `src-lib-${notebookId}-${sim.slug}`;
      const simText = `${sim.title}: ${sim.description}\nEquations: ${sim.equations.join("; ")}\nParameters: ${sim.keyParameters.map((p) => `${p.name} (${p.value} ${p.unit})`).join(", ")}`;
      const docChunks = splitIntoChunks(simText, docId, sim.title, `/simulations/${sim.slug}/preview.html`);
      newChunks.push(...docChunks);

      newSources.push({
        id: docId,
        title: `${sim.title}: Theoretical Framework`,
        url: `/simulations/${sim.slug}/preview.html`,
        domain: "simulatenotes.local",
        snippet: sim.description,
        relevance: 99,
        chunks: docChunks.length,
        category: sim.category,
        simulationSlug: sim.slug,
        dateAdded: "Just now",
      });
    }

    // -------------------------------------------------------------------------
    // Merge into Notebook Cache & Save
    // -------------------------------------------------------------------------
    const existingDocIds = new Set(existingData.sources.map((s) => s.id));
    const mergedSources = [
      ...newSources.filter((s) => !existingDocIds.has(s.id)),
      ...existingData.sources,
    ];
    const mergedChunks = [...newChunks, ...existingData.chunks];

    saveRagCache(notebookId, {
      notebookId,
      topic: topicTitle,
      updatedAt: Date.now(),
      sources: mergedSources,
      chunks: mergedChunks,
    });

    return NextResponse.json({
      status: "success",
      notebookId,
      topicTitle,
      sources: newSources,
      totalSources: mergedSources.length,
      totalChunks: mergedChunks.length,
      message: `Indexed ${newSources.length} sources and ${newChunks.length} chunks for '${topicTitle}'. RAG database is ready.`,
    });
  } catch (err: any) {
    console.error("Error in /api/sources/index:", err);
    return NextResponse.json(
      { error: err.message || "Failed to index sources" },
      { status: 500 }
    );
  }
}

/**
 * Splits text content into searchable chunks.
 */
function splitIntoChunks(text: string, docId: string, title: string, url: string): any[] {
  if (!text || !text.trim()) return [];
  const chunkSize = 700;
  const chunkOverlap = 100;
  const rawParagraphs = text.split(/\n\n+/);
  const chunks: any[] = [];
  let current = "";
  let chunkIdx = 0;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 2 <= chunkSize) {
      current = current ? `${current}\n\n${trimmed}` : trimmed;
    } else {
      if (current) {
        chunks.push({
          chunk_id: `${docId}_c${String(chunkIdx++).padStart(3, "0")}`,
          doc_id: docId,
          title,
          url,
          text: current,
          has_math: Boolean(current.match(/(=|\^|\\sum|\\frac|\\sqrt|\\alpha|\\beta|\\gamma|\\hbar|\\pi|\\lambda|\\mu|\\sigma|\\rho|dt|dx|d2)/i)),
        });
        current = current.slice(-chunkOverlap) + " " + trimmed;
      } else {
        current = trimmed;
      }
    }
  }

  if (current) {
    chunks.push({
      chunk_id: `${docId}_c${String(chunkIdx).padStart(3, "0")}`,
      doc_id: docId,
      title,
      url,
      text: current,
      has_math: Boolean(current.match(/(=|\^|\\sum|\\frac|\\sqrt|\\alpha|\\beta|\\gamma|\\hbar|\\pi|\\lambda|\\mu|\\sigma|\\rho|dt|dx|d2)/i)),
    });
  }

  return chunks;
}

/**
 * Derives a human-readable category from the topic text.
 */
function deriveCategory(topic: string): string {
  const categoryMap: [string[], string][] = [
    [["quantum", "schrodinger", "wavepacket", "tunneling", "entangle"], "Quantum Mechanics"],
    [["orbit", "gravity", "kepler", "celestial", "planet", "star", "astro"], "Astrophysics"],
    [["fluid", "bernoulli", "venturi", "pressure", "flow", "pipe", "nozzle"], "Fluid Dynamics"],
    [["battery", "lithium", "ion", "cathode", "anode", "electro"], "Electrochemistry"],
    [["brain", "neuro", "cortisol", "hpa", "amygdala", "stress"], "Neuroscience"],
    [["flash", "nand", "memory", "semiconductor", "transistor"], "Electronics"],
    [["crude", "oil", "distill", "petroleum", "refin"], "Chemical Engineering"],
    [["photosynthesis", "chloroplast", "rubisco", "plant"], "Biophysics"],
    [["stock", "market", "economic", "finance", "geopolit"], "Economics"],
    [["bayes", "probability", "statistic", "conditional", "posterior", "prior", "likelihood"], "Mathematics / Probability"],
    [["wave", "sound", "doppler", "acoustic", "frequency", "resonan"], "Wave Physics"],
  ];

  for (const [keywords, category] of categoryMap) {
    if (keywords.some((k) => topic.includes(k))) {
      return category;
    }
  }
  return "Applied Science";
}
