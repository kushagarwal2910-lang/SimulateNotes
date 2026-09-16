import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { activeJobs } from "@/lib/jobStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topic, notebookId } = body;
    const searchTopic = query || topic;

    if (!searchTopic) {
      return NextResponse.json({ error: "Query/topic is required" }, { status: 400 });
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create job tracking directory
    const projectRoot = process.cwd();
    const jobDir = path.join(projectRoot, "scratch", "jobs", jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    // Write initial status
    const initialStatus = {
      status: "running",
      step: "init",
      detail: `Starting pipeline for: ${searchTopic}`,
      timestamp: Date.now() / 1000,
    };
    fs.writeFileSync(
      path.join(jobDir, "status.json"),
      JSON.stringify(initialStatus, null, 2)
    );

    // Track job
    activeJobs.set(jobId, {
      status: "running",
      startTime: Date.now(),
      topic: searchTopic,
    });

    // Spawn Python pipeline as a detached background process
    const pythonScript = path.join(projectRoot, "scripts", "run_pipeline.py");
    
    const pyArgs = [
      pythonScript,
      "--topic", searchTopic,
      "--job-id", jobId,
    ];
    if (notebookId) {
      pyArgs.push("--notebook-id", notebookId);
    }

    const child = spawn("python", ["-u", ...pyArgs], {
      cwd: projectRoot,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PYTHONUNBUFFERED: "1", PYTHONIOENCODING: "utf-8" },
    });

    activeJobs.set(jobId, {
      status: "running",
      startTime: Date.now(),
      topic: searchTopic,
      pid: child.pid,
    });

    // Collect stdout for result (non-blocking)
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
      // Log progress to server console
      const lines = data.toString().split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        console.log(`[Pipeline ${jobId}] ${line}`);
      }
    });

    child.on("close", (code: number | null) => {
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = code === 0 ? "completed" : "error";
        activeJobs.set(jobId, job);
      }
      
      const statusPath = path.join(jobDir, "status.json");

      // Check if Python script already wrote the authoritative status.json with a simulation
      let hasValidCompletedStatus = false;
      if (fs.existsSync(statusPath)) {
        try {
          const currentStatus = JSON.parse(fs.readFileSync(statusPath, "utf-8"));
          if (currentStatus.status === "completed" && currentStatus.result?.simulation) {
            hasValidCompletedStatus = true;
          }
        } catch (e) {}
      }

      if (!hasValidCompletedStatus) {
        if (code === 0 && stdout.trim()) {
          try {
            const firstBrace = stdout.indexOf("{");
            const lastBrace = stdout.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              const jsonSub = stdout.substring(firstBrace, lastBrace + 1);
              const parsed = JSON.parse(jsonSub);
              if (parsed.simulation) {
                fs.writeFileSync(statusPath, JSON.stringify({
                  status: "completed",
                  step: "done",
                  detail: "Simulation generated successfully!",
                  timestamp: Date.now() / 1000,
                  result: parsed,
                }, null, 2));
              }
            }
          } catch (parseErr) {
            console.error(`[Pipeline ${jobId}] Failed to parse stdout JSON:`, parseErr);
          }
        } else if (code !== 0) {
          console.error(`[Pipeline ${jobId}] Process exited with code ${code}`);
          fs.writeFileSync(statusPath, JSON.stringify({
            status: "error",
            step: "failed",
            detail: stderr.slice(-500) || `Process exited with code ${code}`,
            timestamp: Date.now() / 1000,
          }, null, 2));
        }
      }
    });

    // Unref so the Node process doesn't wait for the child
    child.unref();

    return NextResponse.json({
      status: "started",
      jobId,
      topic: searchTopic,
      message: "Pipeline started. Poll /api/generate-simulation/{jobId} for status.",
    });

  } catch (error: any) {
    console.error("Error in /api/generate-simulation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
