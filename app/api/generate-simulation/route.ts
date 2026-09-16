import { NextRequest, NextResponse } from "next/server";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";
import { setJob, getJob } from "@/lib/storage";
import { generateSimulation } from "@/lib/simulationGenerator";

function findCatalogMatch(topic: string): SimulationItem | undefined {
  const clean = topic.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  // Exact match
  const exact = SIMULATIONS_CATALOG.find(
    (s) => s.slug.toLowerCase() === clean || s.title.toLowerCase() === clean
  );
  if (exact) return exact;

  // Keyword / slug / title match
  const queryTokens = clean.split(/\s+/).filter((t: string) => t.length > 2 && !['simulate', 'simulation', 'generate', 'model', 'show', 'create', 'build', 'please', 'with', 'about', 'the'].includes(t));
  let bestMatch: SimulationItem | undefined;
  let highestScore = 0;

  for (const item of SIMULATIONS_CATALOG) {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const slugLower = item.slug.toLowerCase().replace(/_/g, " ");

    if (clean.includes(titleLower) || clean.includes(slugLower)) score += 20;

    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 5;
      if (slugLower.includes(token)) score += 5;
    }

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
    const { query, topic, notebookId } = body;
    const searchTopic = (query || topic || "").trim();

    if (!searchTopic) {
      return NextResponse.json({ error: "Query/topic is required" }, { status: 400 });
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Check catalog for an exact or high-confidence match
    const catalogMatch = findCatalogMatch(searchTopic);
    if (catalogMatch) {
      const completedStatus = {
        status: "completed",
        step: "completed",
        detail: `Loaded pre-compiled simulation for: ${catalogMatch.title}`,
        timestamp: Date.now() / 1000,
        result: { simulation: catalogMatch },
        simulation: catalogMatch,
      };
      setJob(jobId, completedStatus);

      return NextResponse.json({
        status: "completed",
        jobId,
        topic: searchTopic,
        simulation: catalogMatch,
        message: "Simulation ready immediately from catalog.",
      });
    }

    // Initialize job state for real-time progress polling
    const initialStatus = {
      status: "running",
      step: "spec",
      detail: `Synthesizing physical model and state equations for: ${searchTopic}`,
      timestamp: Date.now() / 1000,
    };
    setJob(jobId, initialStatus);

    // Run real-time simulation generation
    const onProgress = (step: string, detail: string) => {
      setJob(jobId, {
        status: "running",
        step,
        detail,
        timestamp: Date.now() / 1000,
      });
    };

    try {
      const simulation = await generateSimulation(searchTopic, jobId, onProgress);

      const completedStatus = {
        status: "completed",
        step: "completed",
        detail: `Verified and compiled 60 FPS simulation for: ${simulation.title}`,
        timestamp: Date.now() / 1000,
        result: { simulation },
        simulation,
      };
      setJob(jobId, completedStatus);

      return NextResponse.json({
        status: "completed",
        jobId,
        topic: searchTopic,
        simulation,
        message: "Simulation generated successfully.",
      });
    } catch (genErr: any) {
      console.error("Simulation generation error:", genErr);
      setJob(jobId, {
        status: "error",
        step: "error",
        detail: genErr?.message || "Failed to generate simulation",
        timestamp: Date.now() / 1000,
      });

      return NextResponse.json(
        {
          status: "error",
          jobId,
          error: genErr?.message || "Generation error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in /api/generate-simulation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
