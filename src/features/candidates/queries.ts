import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import { applications, securityClearanceValues } from "@/server/db/schema";

type Application = typeof applications.$inferSelect;

// jobId-scoped: a person may apply to several different jobs, but only holds
// one application per job — and one general CV submission (jobId null).
function jobScope(jobId: string | null) {
  return jobId ? eq(applications.jobId, jobId) : isNull(applications.jobId);
}

// For a signed-in candidate: their own row, or an anonymous row they created
// before signing up. The anonymous match uses the Supabase Auth-verified
// session email (never the form email) so one account can't claim another
// person's submission.
export async function findExistingApplicationForCandidate(
  candidateId: string,
  sessionEmail: string,
  jobId: string | null
): Promise<Application | null> {
  const [own] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.candidateId, candidateId), jobScope(jobId)))
    .orderBy(desc(applications.submittedAt))
    .limit(1);
  if (own) return own;

  const [anonymous] = await db
    .select()
    .from(applications)
    .where(
      and(
        isNull(applications.candidateId),
        sql`lower(${applications.email}) = ${sessionEmail.toLowerCase()}`,
        jobScope(jobId)
      )
    )
    .orderBy(desc(applications.submittedAt))
    .limit(1);
  return anonymous ?? null;
}

export async function existsApplicationForEmail(
  email: string,
  jobId: string | null
): Promise<boolean> {
  const [existing] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(sql`lower(${applications.email}) = ${email.toLowerCase()}`, jobScope(jobId)))
    .limit(1);
  return Boolean(existing);
}

export async function replaceApplication(
  id: string,
  candidateId: string,
  values: {
    name: string;
    email: string;
    phone: string;
    targetIndustry: string;
    currentRole: string;
    linkedIn?: string;
    securityClearance: (typeof securityClearanceValues)[number];
    resumeStorageKey: string;
    marketingConsent: boolean;
  }
): Promise<void> {
  await db
    .update(applications)
    .set({ ...values, candidateId, updatedAt: new Date() })
    .where(eq(applications.id, id));
}
