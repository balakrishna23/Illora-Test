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
      resumeR2Key: applications.resumeR2Key,
      coverLetterR2Key: applications.coverLetterR2Key,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.submittedAt));
}
