import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { PRESET_SIMULATENOTES, SimulateNote, getSimulationBySlug } from "@/lib/simulateNotesData";
import { SIMULATIONS_CATALOG } from "@/lib/simulationsData";

function getDeletedNotesSet(): Set<string> {
  const projectRoot = process.cwd();
  const deletedFilePath = path.join(projectRoot, "scratch", "deleted_notes.json");
  if (fs.existsSync(deletedFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(deletedFilePath, "utf-8"));
      if (Array.isArray(data)) return new Set(data);
    } catch (e) {}
  }
  return new Set();
}

function saveDeletedNoteId(id: string) {
  const projectRoot = process.cwd();
  const scratchDir = path.join(projectRoot, "scratch");
  fs.mkdirSync(scratchDir, { recursive: true });
  const deletedFilePath = path.join(scratchDir, "deleted_notes.json");
  const currentSet = getDeletedNotesSet();
  currentSet.add(id);
  fs.writeFileSync(deletedFilePath, JSON.stringify(Array.from(currentSet), null, 2), "utf-8");
}

function removeDeletedNoteId(id: string) {
  const projectRoot = process.cwd();
  const scratchDir = path.join(projectRoot, "scratch");
  const deletedFilePath = path.join(scratchDir, "deleted_notes.json");
  const currentSet = getDeletedNotesSet();
  if (currentSet.has(id)) {
    currentSet.delete(id);
    fs.writeFileSync(deletedFilePath, JSON.stringify(Array.from(currentSet), null, 2), "utf-8");
  }
}

function formatTopicTitle(raw: string): string {
  if (!raw) return "Untitled Note";
  let clean = raw.trim();

  // Clean conversational prefixes and suffixes
  clean = clean
    .replace(/^i want to learn about (?:how )?/i, "")
    .replace(/^i want to know (?:about )?/i, "")
    .replace(/^tell me about (?:how )?/i, "")
    .replace(/^how does (?:a )?/i, "")
    .replace(/^how do /i, "")
    .replace(/^explain (?:how )?/i, "")
    .replace(/ info regarding (?:it|this)?/gi, "")
    .replace(/ information regarding (?:it|this)?/gi, "")
    .replace(/ info about (?:it|this)?/gi, "")
    .trim();

  // Match common domain phrases to clean titles
  if (/kidney/i.test(clean)) {
    return "Kidneys & Renal Physiology";
  }
  if (/stomach.*digest.*acid|gastric.*acid/i.test(clean)) {
    return "Stomach Digestion & Gastric Acid Dynamics";
  }
  if (/crude.*oil|petroleum.*refin/i.test(clean)) {
    return "Crude Oil Distillation & Petroleum Refining";
  }

  // Standard Title Case
  clean = clean
    .split(/\s+/)
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && ["and", "or", "the", "a", "an", "in", "of", "to", "for", "with", "on"].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return clean.charAt(0).toUpperCase() + clean.slice(1) || raw;
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const ragCacheDir = path.join(projectRoot, "scratch", "rag_cache");
    const deletedIds = getDeletedNotesSet();

    const userNotes: SimulateNote[] = [];
    const presetIds = new Set(PRESET_SIMULATENOTES.map((n) => n.id));

    if (fs.existsSync(ragCacheDir)) {
      const files = fs.readdirSync(ragCacheDir).filter((f) => f.endsWith(".json"));

      for (const file of files) {
        const id = file.replace(/\.json$/, "");
        // Skip deleted notes or system files
        if (deletedIds.has(id)) continue;
        // Skip presets that are loaded from catalog unless customized
        if (presetIds.has(id)) continue;

        try {
          const filePath = path.join(ragCacheDir, file);
          const raw = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(raw);

          const title = formatTopicTitle(data.topic || data.title || "Custom Note");
          const firstSnippet = data.sources?.[0]?.snippet || "";
          const description =
            data.description ||
            (firstSnippet
              ? firstSnippet.slice(0, 135).trim() + "..."
              : `Authoritative research workspace on ${data.topic || title} grounded in RAG sources and simulations.`);

          let formattedDate = "Recently";
          if (data.updatedAt) {
            formattedDate = new Date(data.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }

          // Check if simulation exists, matches slug, or matches topic keywords
          let resolvedSim = data.simulation || null;
          if (!resolvedSim && data.simulationSlug) {
            resolvedSim = getSimulationBySlug(data.simulationSlug);
          }
          if (!resolvedSim) {
            const t = (data.topic || data.title || id || "").toLowerCase();
            if (t.includes("kidney") || t.includes("renal") || t.includes("nephron") || t.includes("glomerular")) {
              resolvedSim = getSimulationBySlug("human_kidney_nephron_function");
            } else if (t.includes("stomach") || t.includes("gastric") || t.includes("acid") || t.includes("pepsin") || t.includes("digest")) {
              resolvedSim = getSimulationBySlug("stomach_acid_digestion");
            } else if (t.includes("crude") || t.includes("oil") || t.includes("distill") || t.includes("petroleum")) {
              resolvedSim = getSimulationBySlug("crude_oil_distillation");
            } else if (t.includes("bayes") || t.includes("probability")) {
              resolvedSim = getSimulationBySlug("bayes_theorem_conditional_probability");
            } else if (t.includes("quantum") || t.includes("tunnel") || t.includes("wavepacket")) {
              resolvedSim = getSimulationBySlug("quantum_tunneling_barrier");
            } else if (t.includes("orbit") || t.includes("kepler") || t.includes("gravity") || t.includes("celestial")) {
              resolvedSim = getSimulationBySlug("gravitational_orbit_mechanics");
            } else if (t.includes("bernoulli") || t.includes("venturi") || t.includes("fluid")) {
              resolvedSim = getSimulationBySlug("bernoulli");
            } else if (t.includes("battery") || t.includes("lithium") || t.includes("cathode")) {
              resolvedSim = getSimulationBySlug("lithium_ion_battery_dynamics");
            } else if (t.includes("nand") || t.includes("flash") || t.includes("floating gate")) {
              resolvedSim = getSimulationBySlug("usb_flash_nand_memory");
            } else if (t.includes("stress") || t.includes("hpa") || t.includes("amygdala") || t.includes("cortisol")) {
              resolvedSim = getSimulationBySlug("neuroscience_stress_brain_anatomy");
            } else if (t.includes("photosynthesis") || t.includes("rubisco") || t.includes("chloroplast")) {
              resolvedSim = getSimulationBySlug("photosynthesis_limiting_factors");
            }
          }

          const resolvedMessages =
            Array.isArray(data.messages) && data.messages.length > 0
              ? data.messages
              : [
                  {
                    id: `m-init-${id}`,
                    role: "agent_rag",
                    timestamp: "Just now",
                    content: `Welcome to your research workspace on **${title}**.\n\nI have indexed ${data.sources?.length || 0} authoritative sources into this note's localized RAG database. Ask questions or interact with the simulation in the Studio panel on the right!`,
                    citations: data.sources?.map((_: any, idx: number) => idx + 1),
                  },
                ];

          // Persist resolved simulation and messages back to disk if updated
          if ((resolvedSim && !data.simulation) || (!data.messages || data.messages.length === 0)) {
            try {
              data.simulation = resolvedSim;
              data.messages = resolvedMessages;
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
            } catch (syncErr) {
              console.error(`Error syncing simulation/messages back to ${file}:`, syncErr);
            }
          }

          const noteItem: SimulateNote = {
            id: data.notebookId || id,
            title,
            description,
            date: formattedDate,
            sources: Array.isArray(data.sources) ? data.sources : [],
            simulation: resolvedSim,
            messages: resolvedMessages,
          };

          userNotes.push(noteItem);
        } catch (readErr) {
          console.error(`Error loading note from ${file}:`, readErr);
        }
      }
    }

    // Filter preset notes against deletedIds
    const activePresets = PRESET_SIMULATENOTES.filter((p) => !deletedIds.has(p.id));

    // Combine user-generated notes first, followed by active preset notes
    const allNotes: SimulateNote[] = [...userNotes, ...activePresets];

    return NextResponse.json({
      status: "success",
      count: allNotes.length,
      userNotesCount: userNotes.length,
      notes: allNotes,
    });
  } catch (err: any) {
    console.error("Error in GET /api/notes:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load notes", notes: PRESET_SIMULATENOTES },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { note } = body;

    if (!note || !note.id) {
      return NextResponse.json({ error: "Invalid note payload" }, { status: 400 });
    }

    const projectRoot = process.cwd();
    const ragCacheDir = path.join(projectRoot, "scratch", "rag_cache");
    fs.mkdirSync(ragCacheDir, { recursive: true });

    // If it was previously marked as deleted, un-delete it
    removeDeletedNoteId(note.id);

    const noteFilePath = path.join(ragCacheDir, `${note.id}.json`);

    // Merge with existing chunks on disk if already present
    let existingChunks: any[] = [];
    if (fs.existsSync(noteFilePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(noteFilePath, "utf-8"));
        if (Array.isArray(existingData.chunks)) {
          existingChunks = existingData.chunks;
        }
      } catch (e) {}
    }

    // Generate basic chunks from sources if no chunks present
    if (existingChunks.length === 0 && Array.isArray(note.sources) && note.sources.length > 0) {
      existingChunks = note.sources.map((s: any, i: number) => ({
        chunk_id: `chk-${note.id}-${i}`,
        title: s.title,
        text: `${s.title}: ${s.snippet}`,
      }));
    }

    const fileData = {
      notebookId: note.id,
      topic: note.title,
      description: note.description,
      sources: note.sources || [],
      simulation: note.simulation || null,
      messages: note.messages || [],
      chunks: existingChunks,
      updatedAt: Date.now(),
    };

    fs.writeFileSync(noteFilePath, JSON.stringify(fileData, null, 2), "utf-8");

    return NextResponse.json({
      status: "success",
      savedId: note.id,
      note,
    });
  } catch (err: any) {
    console.error("Error in POST /api/notes:", err);
    return NextResponse.json({ error: err.message || "Failed to save note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note id is required" }, { status: 400 });
    }

    // Persist deleted status so it never reappears on reload
    saveDeletedNoteId(id);

    const projectRoot = process.cwd();
    const ragCacheDir = path.join(projectRoot, "scratch", "rag_cache");
    const noteFilePath = path.join(ragCacheDir, `${id}.json`);

    let fileDeleted = false;
    if (fs.existsSync(noteFilePath)) {
      fs.unlinkSync(noteFilePath);
      fileDeleted = true;
    }

    return NextResponse.json({
      status: "success",
      deletedId: id,
      fileDeleted,
    });
  } catch (err: any) {
    console.error("Error in DELETE /api/notes:", err);
    return NextResponse.json({ error: err.message || "Failed to delete note" }, { status: 500 });
  }
}
