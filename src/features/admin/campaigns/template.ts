import type { CampaignRecipient } from "@/features/admin/campaigns/types";

// Placeholders admins can use in the subject and body. Anything else typed
// between {{ }} is left as-is so a typo is visible in the test email instead
// of silently disappearing.
const PLACEHOLDER_FALLBACKS: Record<string, string> = {
  name: "there",
  company: "your company",
};

export function renderTemplate(template: string, recipient: CampaignRecipient): string {
  return template.replace(/\{\{\s*(name|company)\s*\}\}/g, (_match, key: string) => {
    const value = recipient[key as "name" | "company"];
    return value?.trim() ? value.trim() : PLACEHOLDER_FALLBACKS[key];
  });
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderBodyHtml(body: string, unsubscribeUrl: string): string {
  const paragraphs = escapeHtml(body)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");

  return `${paragraphs}<p style="font-size:12px;color:#6b7280;"><a href="${unsubscribeUrl}">Unsubscribe from these emails</a></p>`;
}

export function renderBodyText(body: string, unsubscribeUrl: string): string {
  return `${body}\n\nUnsubscribe: ${unsubscribeUrl}`;
}
