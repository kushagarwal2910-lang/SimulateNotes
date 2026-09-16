import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { activeJobs } from "@/lib/jobStore";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const projectRoot = process.cwd();
    const jobDir = path.join(projectRoot, "scratch", "jobs", jobId);
    const statusFile = path.join(jobDir, "status.json");

    if (fs.existsSync(statusFile)) {
      try {
        const fileContent = fs.readFileSync(statusFile, "utf-8");
        const statusData = JSON.parse(fileContent);

        return NextResponse.json({
          jobId,
          status: statusData.status || "running",
          step: statusData.step || "",
          detail: statusData.detail || "",
          timestamp: statusData.timestamp,
          simulation: statusData.result?.simulation || null,
          error: statusData.result?.error || (statusData.status === "error" ? statusData.detail : null),
        });
      } catch (readErr) {
        console.error(`Error reading status file for ${jobId}:`, readErr);
        // Fall back to activeJobs check
      }
    }

    // Check activeJobs map
    const activeJob = activeJobs.get(jobId);
    if (activeJob) {
      return NextResponse.json({
        jobId,
        status: activeJob.status,
        step: "running",
        detail: `Pipeline in progress for: ${activeJob.topic}`,
        startTime: activeJob.startTime,
      });
    }

    return NextResponse.json(
      { error: "Job not found", jobId, status: "not_found" },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
