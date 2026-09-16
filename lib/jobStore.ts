// In-memory store for active jobs
export interface JobInfo {
  status: string;
  startTime: number;
  topic: string;
  pid?: number;
}

export const activeJobs = new Map<string, JobInfo>();
