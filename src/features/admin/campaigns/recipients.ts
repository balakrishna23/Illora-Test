import type { CampaignRecipient } from "@/features/admin/campaigns/types";

// Dedupes by lowercased email, drops suppressed/blank addresses, and merges
// duplicate rows so a recipient keeps whichever name/company any source had.
export function dedupeRecipients(
  recipients: CampaignRecipient[],
  suppressedEmails: string[]
): CampaignRecipient[] {
  const suppressed = new Set(suppressedEmails.map((email) => email.trim().toLowerCase()));
  const byEmail = new Map<string, CampaignRecipient>();

  for (const recipient of recipients) {
    const email = recipient.email.trim().toLowerCase();
    if (!email || suppressed.has(email)) continue;

    const existing = byEmail.get(email);
    byEmail.set(email, {
      email,
      name: existing?.name ?? recipient.name,
      company: existing?.company ?? recipient.company,
    });
  }

  return [...byEmail.values()];
}
