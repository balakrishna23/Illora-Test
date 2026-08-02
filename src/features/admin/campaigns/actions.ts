"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/server/auth/session";
import {
  sendCampaignEmails,
  type CampaignEmail,
  type CampaignAttachment,
} from "@/server/integrations/resend";
import { createPresignedUploadUrl, getObjectBytes } from "@/server/integrations/supabase-storage";
import {
  createUnsubscribeToken,
  verifyUnsubscribeToken,
} from "@/server/lib/unsubscribe-token";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { campaignAudienceValues } from "@/server/db/schema";
import {
  completeCampaignRecord,
  createCampaignRecord,
  getCampaignRecipients,
  getCampaignSignature,
  setCampaignSignature,
  suppressEmail,
} from "@/features/admin/campaigns/queries";
import {
  renderBodyHtml,
  renderBodyText,
  renderTemplate,
} from "@/features/admin/campaigns/template";
import type {
  CampaignRecipient,
  SubmitCampaignState,
} from "@/features/admin/campaigns/types";

const campaignSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Keep the subject under 200 characters"),
  body: z.string().min(1, "Body is required").max(10000, "Keep the body under 10,000 characters"),
  audience: z.enum(campaignAudienceValues),
  intent: z.enum(["test", "send"]),
  confirm: z.string().optional(),
  replyTo: z.string().email("Must be a valid email").optional().or(z.literal("")),
  includeSignature: z.preprocess((v) => v === "on", z.boolean()),
  attachmentStorageKey: z.string().optional().or(z.literal("")),
  attachmentFilename: z.string().optional().or(z.literal("")),
});

function buildEmail(
  recipient: CampaignRecipient,
  subjectTemplate: string,
  bodyTemplate: string,
  signature: string | null
): CampaignEmail {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/email-preferences/unsubscribe?email=${encodeURIComponent(recipient.email)}&token=${createUnsubscribeToken(recipient.email)}`;
  const rendered = renderTemplate(bodyTemplate, recipient);
  const body = signature ? `${rendered}\n\n${signature}` : rendered;

  return {
    to: recipient.email,
    subject: renderTemplate(subjectTemplate, recipient),
    html: renderBodyHtml(body, unsubscribeUrl),
    text: renderBodyText(body, unsubscribeUrl),
    unsubscribeUrl,
  };
}

// Campaign attachments upload to the same storage bucket as resumes, under
// their own prefix. Reuses the presigned-PUT pattern from candidates/actions.ts.
const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export async function getCampaignAttachmentUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  const session = await requireAdmin();
  if (!session.success) throw new Error(session.error);

  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `campaign-attachments/${Date.now()}-${safeFilename}`;

  const { uploadUrl } = await createPresignedUploadUrl({ key, contentType });
  return { uploadUrl, key };
}

export type SignatureFormState = { success: true } | { success: false; error: string };

export async function updateCampaignSignature(
  _prev: SignatureFormState | null,
  formData: FormData
): Promise<SignatureFormState> {
  const session = await requireAdmin();
  if (!session.success) return { success: false, error: session.error };

  const signature = String(formData.get("signature") ?? "").trim();
  await setCampaignSignature(signature || null);

  revalidatePath("/admin/campaigns");
  return { success: true };
}

export async function submitCampaign(
  _prev: SubmitCampaignState,
  formData: FormData
): Promise<SubmitCampaignState> {
  const session = await requireAdmin();
  if (!session.success) return { success: false, error: session.error };

  // Guarded here so a misconfigured server returns a typed error instead of
  // throwing from createUnsubscribeToken mid-send.
  if (!process.env.CAMPAIGN_UNSUBSCRIBE_SECRET || !process.env.NEXT_PUBLIC_SITE_URL) {
    return {
      success: false,
      error:
        "Email sending is not configured — set CAMPAIGN_UNSUBSCRIBE_SECRET and NEXT_PUBLIC_SITE_URL.",
    };
  }

  const parsed = campaignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const {
    subject,
    body,
    audience,
    intent,
    confirm,
    replyTo,
    includeSignature,
    attachmentStorageKey,
    attachmentFilename,
  } = parsed.data;

  const signature = includeSignature ? await getCampaignSignature() : null;

  let attachment: CampaignAttachment | undefined;
  if (attachmentStorageKey && attachmentFilename) {
    const object = await getObjectBytes(attachmentStorageKey);
    if (!object) {
      return { success: false, error: "The attachment upload didn't complete — please re-attach the file." };
    }
    if (object.bytes.byteLength > ATTACHMENT_MAX_BYTES) {
      return { success: false, error: "Attachment is over the 10 MB limit — please attach a smaller file." };
    }
    attachment = { filename: attachmentFilename, content: Buffer.from(object.bytes) };
  }

  const sendOptions = {
    ...(replyTo ? { replyTo } : {}),
    ...(attachment ? { attachment } : {}),
  };

  if (intent === "test") {
    const testEmail = buildEmail(
      { email: session.email, name: "Test Recipient", company: "Example Co" },
      `[Test] ${subject}`,
      body,
      signature
    );
    const { sentCount } = await sendCampaignEmails([testEmail], sendOptions);
    if (sentCount === 0) {
      return { success: false, error: "Test email failed to send. Check the Resend configuration." };
    }
    return { success: true, message: `Test email sent to ${session.email}.` };
  }

  if (confirm !== "on") {
    return { success: false, error: "Tick the confirmation box before sending to the full audience." };
  }

  const recipients = await getCampaignRecipients(audience);
  if (recipients.length === 0) {
    return { success: false, error: "This audience has no reachable recipients." };
  }

  const campaignId = await createCampaignRecord({
    subject,
    body,
    audience,
    recipientCount: recipients.length,
    createdBy: session.email,
    replyTo: replyTo || null,
    attachmentStorageKey: attachmentStorageKey || null,
    attachmentFilename: attachmentFilename || null,
  });

  const { sentCount, failedCount } = await sendCampaignEmails(
    recipients.map((recipient) => buildEmail(recipient, subject, body, signature)),
    sendOptions
  );
  await completeCampaignRecord(campaignId, {
    sentCount,
    failedCount,
    status: sentCount === 0 ? "failed" : "sent",
  });
  revalidatePath("/admin/campaigns");

  if (sentCount === 0) {
    return { success: false, error: "The send failed — no emails went out. Check the Resend configuration." };
  }
  return {
    success: true,
    message: `Campaign sent to ${sentCount} recipient${sentCount === 1 ? "" : "s"}${failedCount > 0 ? ` (${failedCount} failed)` : ""}.`,
  };
}

// Public: the HMAC token in the emailed link is the trust boundary. The write
// happens on this confirm POST — not on the GET page render — so inbox link
// scanners that prefetch URLs can't silently unsubscribe people.
export async function confirmCampaignUnsubscribe(formData: FormData): Promise<void> {
  const email = formData.get("email");
  const token = formData.get("token");
  if (typeof email !== "string" || typeof token !== "string") {
    redirect("/email-preferences/unsubscribe");
  }

  const rate = await checkRateLimit("confirmCampaignUnsubscribe", { limit: 10 });
  if (!rate.ok) redirect("/email-preferences/unsubscribe");

  if (!verifyUnsubscribeToken(email, token)) redirect("/email-preferences/unsubscribe");

  await suppressEmail(email);
  redirect("/email-preferences/unsubscribe?done=1");
}
