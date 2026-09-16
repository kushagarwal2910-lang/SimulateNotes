import { NextRequest, NextResponse } from "next/server";
import { SIMULATIONS_CATALOG, SimulationItem } from "@/lib/simulationsData";
import { setJob, getJob } from "@/lib/storage";
import { generateSimulation } from "@/lib/simulationGenerator";

function findExactSlugMatch(topic: string): SimulationItem | undefined {
  const clean = topic.trim().toLowerCase();
  return SIMULATIONS_CATALOG.find(
    (s) => s.slug === clean || s.id === clean
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topic, notebookId, exactCatalogSlug } = body;
    const searchTopic = (query || topic || "").trim();

    if (!searchTopic) {
      return NextResponse.json({ error: "Query/topic is required" }, { status: 400 });
    }

    // Generate unique job ID with embedded topic slug
    const topicSlug = searchTopic.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 32);
    const jobId = `job_${topicSlug}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Check catalog ONLY if explicitly requested via exact slug
    const exactMatch = exactCatalogSlug ? findExactSlugMatch(exactCatalogSlug) : findExactSlugMatch(searchTopic);
    if (exactMatch && exactCatalogSlug) {
      const completedStatus = {
        status: "completed",
        step: "completed",
        detail: `Loaded pre-compiled simulation for: ${exactMatch.title}`,
        timestamp: Date.now() / 1000,
        result: { simulation: exactMatch },
        simulation: exactMatch,
      };
      setJob(jobId, completedStatus);

      return NextResponse.json({
        status: "completed",
        jobId,
        topic: searchTopic,
        simulation: exactMatch,
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
