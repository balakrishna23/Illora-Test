"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/server/auth/session";
import {
  getOrCreateCandidate,
  isJobSaved,
  removeSavedJob,
  saveJob,
} from "@/features/portal/queries";
import type { ToggleSaveJobState } from "@/features/portal/types";

const toggleSaveJobSchema = z.object({
  jobId: z.string().min(1),
  jobSlug: z.string().min(1),
  jobTitle: z.string().min(1),
});

export async function toggleSaveJob(
  jobId: string,
  jobSlug: string,
  jobTitle: string
): Promise<ToggleSaveJobState> {
  const session = await requireUser();
  if (!session.success) {
    return { success: false, error: session.error };
  }

  const parsed = toggleSaveJobSchema.safeParse({ jobId, jobSlug, jobTitle });
  if (!parsed.success) {
    return { success: false, error: "Invalid job." };
  }

  const candidate = await getOrCreateCandidate(session.userId, session.email);
  const alreadySaved = await isJobSaved(candidate.id, parsed.data.jobId);

  if (alreadySaved) {
    await removeSavedJob(candidate.id, parsed.data.jobId);
  } else {
    await saveJob(candidate.id, {
      id: parsed.data.jobId,
      slug: parsed.data.jobSlug,
      title: parsed.data.jobTitle,
    });
  }

  revalidatePath("/portal");

  return { success: true, saved: !alreadySaved };
}
