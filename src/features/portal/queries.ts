import { and, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { applications, candidates, savedJobs } from "@/server/db/schema";
import type { Job } from "@/server/integrations/jobadder";

type Candidate = typeof candidates.$inferSelect;
type SavedJob = typeof savedJobs.$inferSelect;
type Application = typeof applications.$inferSelect;

export async function getCandidateByAuthUserId(
  authUserId: string
): Promise<Candidate | null> {
  const [existing] = await db
    .select()
    .from(candidates)
    .where(eq(candidates.authUserId, authUserId));

  return existing ?? null;
}

export async function getOrCreateCandidate(
  authUserId: string,
  email: string
): Promise<Candidate> {
  const [existing] = await db
    .select()
    .from(candidates)
    .where(eq(candidates.authUserId, authUserId));

  if (existing) return existing;

  const [created] = await db.insert(candidates).values({ authUserId, email }).returning();
  return created;
}

export async function getSavedJobs(candidateId: string): Promise<SavedJob[]> {
  return db.select().from(savedJobs).where(eq(savedJobs.candidateId, candidateId));
}

export async function isJobSaved(candidateId: string, jobId: string): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(savedJobs)
    .where(and(eq(savedJobs.candidateId, candidateId), eq(savedJobs.jobId, jobId)));

  return Boolean(existing);
}

export async function saveJob(
  candidateId: string,
  job: Pick<Job, "id" | "slug" | "title">
): Promise<SavedJob> {
  const [saved] = await db
    .insert(savedJobs)
    .values({
      candidateId,
      jobId: job.id,
      jobSlug: job.slug,
      jobTitle: job.title,
    })
    .returning();

  return saved;
}

export async function removeSavedJob(candidateId: string, jobId: string): Promise<void> {
  await db
    .delete(savedJobs)
    .where(and(eq(savedJobs.candidateId, candidateId), eq(savedJobs.jobId, jobId)));
}

export async function getApplications(candidateId: string): Promise<Application[]> {
  return db.select().from(applications).where(eq(applications.candidateId, candidateId));
}
