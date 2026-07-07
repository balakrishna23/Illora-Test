export type JobAlertCriteria = {
  industry?: string;
  state?: string;
  jobType?: string;
  keyword?: string;
};

export type CreateJobAlertState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
