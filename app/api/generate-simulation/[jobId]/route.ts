import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const jobData = getJob(jobId);

    if (jobData) {
      return NextResponse.json({
        jobId,
        status: jobData.status || "running",
        step: jobData.step || "",
        detail: jobData.detail || "",
        timestamp: jobData.timestamp,
        simulation: jobData.result?.simulation || jobData.simulation || null,
        error: jobData.result?.error || (jobData.status === "error" ? jobData.detail : null),
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
