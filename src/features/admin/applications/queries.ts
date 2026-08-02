import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { applications, jobs } from "@/server/db/schema";

export async function getAllApplications() {
  return db
    .select({
      id: applications.id,
      name: applications.name,
      email: applications.email,
      phone: applications.phone,
      targetIndustry: applications.targetIndustry,
      currentRole: applications.currentRole,
      securityClearance: applications.securityClearance,
      status: applications.status,
      submittedAt: applications.submittedAt,
      jobId: applications.jobId,
      jobSlug: applications.jobSlug,
      jobTitle: applications.jobTitle,
      liveJobTitle: jobs.title,
      liveJobSlug: jobs.slug,
      // Keys are converted to booleans at the server/client boundary (the page)
      // and never passed to the browser — downloads are signed on demand.
      resumeStorageKey: applications.resumeStorageKey,
      coverLetterStorageKey: applications.coverLetterStorageKey,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.submittedAt));
}

type ApplicationFileAccess = {
  name: string;
  targetIndustry: string;
  currentRole: string;
  resumeStorageKey: string | null;
  coverLetterStorageKey: string | null;
};

// Shared lookup for both the resume-download action and the AI-review
// action — both need the same "find this application's file key(s), gated
// server-side" step.
export async function getApplicationForFileAccess(
  id: string
): Promise<ApplicationFileAccess | null> {
  const [application] = await db
    .select({
      name: applications.name,
      targetIndustry: applications.targetIndustry,
      currentRole: applications.currentRole,
      resumeStorageKey: applications.resumeStorageKey,
      coverLetterStorageKey: applications.coverLetterStorageKey,
    })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  return application ?? null;
}
