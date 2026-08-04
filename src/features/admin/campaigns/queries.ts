import { and, desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  applications,
  campaignSettings,
  contactMessages,
  emailCampaigns,
  emailSuppressions,
  vacancyRequests,
} from "@/server/db/schema";
import { JOB_INDUSTRIES } from "@/lib/job-constants";
import { dedupeRecipients } from "@/features/admin/campaigns/recipients";
import type {
  AudienceCounts,
  CampaignAudience,
  CampaignRecipient,
} from "@/features/admin/campaigns/types";

// "candidates:<industry>" audience values target the industry a candidate
// picked on their CV submission (applications.target_industry) — plain
// "candidates" means every consenting candidate regardless of industry.
function parseAudience(
  audience: CampaignAudience
): { base: "candidates" | "clients" | "general" | "all"; industry?: string } {
  if (audience.startsWith("candidates:")) {
    return { base: "candidates", industry: audience.slice("candidates:".length) };
  }
  return { base: audience as "candidates" | "clients" | "general" | "all" };
}

// Consent gate: only people who explicitly opted in to marketing at submission
// (marketing_consent = true) are reachable. The plain `candidates` table
// (account sign-ups) has no consent capture point, so it is intentionally
// NOT a source — including it would email people who never opted in (Spam Act 2003).
async function getCandidateRows(industry?: string): Promise<CampaignRecipient[]> {
  const conditions = [eq(applications.marketingConsent, true)];
  if (industry) conditions.push(eq(applications.targetIndustry, industry));

  return db
    .select({ email: applications.email, name: applications.name })
    .from(applications)
    .where(and(...conditions));
}

async function getCandidateRowsByIndustry(): Promise<
  (CampaignRecipient & { targetIndustry: string })[]
> {
  return db
    .select({
      email: applications.email,
      name: applications.name,
      targetIndustry: applications.targetIndustry,
    })
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

// General enquiries via the site-wide contact form — a third consent source
// distinct from candidates (applications) and clients (vacancy requests).
async function getGeneralRows(): Promise<CampaignRecipient[]> {
  return db
    .select({ email: contactMessages.email, name: contactMessages.name })
    .from(contactMessages)
    .where(eq(contactMessages.marketingConsent, true));
}

async function getSuppressedEmails(): Promise<string[]> {
  const rows = await db.select({ email: emailSuppressions.email }).from(emailSuppressions);
  return rows.map((row) => row.email);
}

export async function getCampaignRecipients(
  audience: CampaignAudience
): Promise<CampaignRecipient[]> {
  const { base, industry } = parseAudience(audience);
  const includeCandidates = base === "candidates" || base === "all";
  const includeClients = base === "clients" || base === "all";
  const includeGeneral = base === "general" || base === "all";

  const [candidateRows, clientRows, generalRows, suppressed] = await Promise.all([
    includeCandidates ? getCandidateRows(industry) : Promise.resolve([]),
    includeClients ? getClientRows() : Promise.resolve([]),
    includeGeneral ? getGeneralRows() : Promise.resolve([]),
    getSuppressedEmails(),
  ]);
  return dedupeRecipients([...candidateRows, ...clientRows, ...generalRows], suppressed);
}

export async function getAudienceCounts(): Promise<AudienceCounts> {
  const [candidateRows, clientRows, generalRows, suppressed] = await Promise.all([
    getCandidateRowsByIndustry(),
    getClientRows(),
    getGeneralRows(),
    getSuppressedEmails(),
  ]);

  const counts = {
    candidates: dedupeRecipients(candidateRows, suppressed).length,
    clients: dedupeRecipients(clientRows, suppressed).length,
    general: dedupeRecipients(generalRows, suppressed).length,
    all: dedupeRecipients([...candidateRows, ...clientRows, ...generalRows], suppressed).length,
  } as AudienceCounts;

  for (const industry of JOB_INDUSTRIES) {
    const rowsForIndustry = candidateRows.filter((row) => row.targetIndustry === industry);
    counts[`candidates:${industry}`] = dedupeRecipients(rowsForIndustry, suppressed).length;
  }

  return counts;
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
  replyTo?: string | null;
  attachmentStorageKey?: string | null;
  attachmentFilename?: string | null;
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

export async function getCampaignSignature(): Promise<string | null> {
  const [row] = await db
    .select({ signature: campaignSettings.signature })
    .from(campaignSettings)
    .limit(1);
  return row?.signature ?? null;
}

export async function setCampaignSignature(signature: string | null): Promise<void> {
  const [existing] = await db
    .select({ id: campaignSettings.id })
    .from(campaignSettings)
    .limit(1);

  if (existing) {
    await db
      .update(campaignSettings)
      .set({ signature, updatedAt: new Date() })
      .where(eq(campaignSettings.id, existing.id));
  } else {
    await db.insert(campaignSettings).values({ signature });
  }
}
