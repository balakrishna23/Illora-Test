"use server";

import { z } from "zod";

import { AU_STATES, JOB_INDUSTRIES, JOB_TYPES } from "@/server/integrations/jobadder";
import { createJobAlert, unsubscribeJobAlert } from "@/features/job-alerts/queries";
import { isBotSubmission } from "@/lib/honeypot";
import type { CreateJobAlertState } from "@/features/job-alerts/types";

const jobAlertSchema = z.object({
  email: z.string().email("Valid email required"),
  industry: z.enum(JOB_INDUSTRIES).optional().or(z.literal("")),
  state: z.enum(AU_STATES).optional().or(z.literal("")),
  jobType: z.enum(JOB_TYPES).optional().or(z.literal("")),
  keyword: z.string().optional(),
});

// No auth required: a public opt-in via email is the trust boundary for this
// mutation (verified only by the unsubscribe token in the confirmation email).
export async function subscribeToJobAlert(
  _prev: CreateJobAlertState | null,
  formData: FormData
): Promise<CreateJobAlertState> {
  // Silently accept bot submissions without persisting.
  if (isBotSubmission(formData)) return { success: true };

  const parsed = jobAlertSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createJobAlert(parsed.data);

  return { success: true };
}

export async function unsubscribeFromJobAlert(
  token: string
): Promise<{ success: boolean }> {
  const found = await unsubscribeJobAlert(token);
  return { success: found };
}
