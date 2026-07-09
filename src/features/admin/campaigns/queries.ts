import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  applications,
  emailCampaigns,
  emailSuppressions,
  vacancyRequests,
} from "@/server/db/schema";
import { dedupeRecipients } from "@/features/admin/campaigns/recipients";
import type {
  AudienceCounts,
  CampaignAudience,
  CampaignRecipient,
} from "@/features/admin/campaigns/types";

// Consent gate: only people who explicitly opted in to marketing at submission
// (marketing_consent = true) are reachable. The plain `candidates` table (Clerk
// sign-ups) has no consent capture point, so it is intentionally NOT a source —
// including it would email people who never opted in (Spam Act 2003).
async function getCandidateRows(): Promise<CampaignRecipient[]> {
  return db
    .select({ email: applications.email, name: applications.name })
    .from(applications)
    .where(eq(applications.marketingConsent, true));
}

async function getClientRows(): Promise<CampaignRecipient[]> {
  return db
    .select({
      email: vacancyRequests.email,
      name: vacancyRequests.contactName,
      company: vacancyRequests.companyName,
    })
    .from(vacancyRequests)
    .where(eq(vacancyRequests.marketingConsent, true));
}

async function getSuppressedEmails(): Promise<string[]> {
  const rows = await db.select({ email: emailSuppressions.email }).from(emailSuppressions);
  return rows.map((row) => row.email);
}

export async function getCampaignRecipients(
  audience: CampaignAudience
): Promise<CampaignRecipient[]> {
  const [candidateRows, clientRows, suppressed] = await Promise.all([
    audience === "clients" ? [] : getCandidateRows(),
    audience === "candidates" ? [] : getClientRows(),
    getSuppressedEmails(),
  ]);
  return dedupeRecipients([...candidateRows, ...clientRows], suppressed);
}

export async function getAudienceCounts(): Promise<AudienceCounts> {
  const [candidateRows, clientRows, suppressed] = await Promise.all([
    getCandidateRows(),
    getClientRows(),
    getSuppressedEmails(),
  ]);

  return {
    candidates: dedupeRecipients(candidateRows, suppressed).length,
    clients: dedupeRecipients(clientRows, suppressed).length,
    all: dedupeRecipients([...candidateRows, ...clientRows], suppressed).length,
  };
}

export async function listCampaigns() {
  return db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
}

export async function createCampaignRecord(input: {
  subject: string;
  body: string;
  audience: CampaignAudience;
  recipientCount: number;
  createdBy: string;
}): Promise<string> {
  const [row] = await db
    .insert(emailCampaigns)
    .values(input)
    .returning({ id: emailCampaigns.id });
  return row.id;
}

export async function completeCampaignRecord(
  id: string,
  input: { sentCount: number; failedCount: number; status: "sent" | "failed" }
): Promise<void> {
  await db
    .update(emailCampaigns)
    .set({ ...input, completedAt: new Date() })
    .where(eq(emailCampaigns.id, id));
}

export async function suppressEmail(email: string): Promise<void> {
  await db
    .insert(emailSuppressions)
    .values({ email: email.trim().toLowerCase() })
    .onConflictDoNothing();
}
