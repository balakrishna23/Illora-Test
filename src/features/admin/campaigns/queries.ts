import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  applications,
  candidates,
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

async function getCandidateRows(): Promise<CampaignRecipient[]> {
  const [applicationRows, candidateRows] = await Promise.all([
    db.select({ email: applications.email, name: applications.name }).from(applications),
    db.select({ email: candidates.email }).from(candidates),
  ]);
  return [...applicationRows, ...candidateRows];
}

async function getClientRows(): Promise<CampaignRecipient[]> {
  return db
    .select({
      email: vacancyRequests.email,
      name: vacancyRequests.contactName,
      company: vacancyRequests.companyName,
    })
    .from(vacancyRequests);
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
