import { Resend } from "resend";

import type { Job } from "@/server/integrations/jobadder";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "alerts@illouraservices.com";

function jobAlertHtml(matches: Job[], unsubscribeUrl: string): string {
  const rows = matches
    .map(
      (job) =>
        `<li><a href="${process.env.NEXT_PUBLIC_SITE_URL}/jobs/${job.slug}">${job.title}</a> — ${job.location}, ${job.state} (${job.type})</li>`
    )
    .join("");

  return `<p>New roles matching your alert:</p><ul>${rows}</ul><p><a href="${unsubscribeUrl}">Unsubscribe from this alert</a></p>`;
}

function jobAlertText(matches: Job[], unsubscribeUrl: string): string {
  const lines = matches
    .map((job) => `${job.title} — ${job.location}, ${job.state} (${job.type})`)
    .join("\n");

  return `New roles matching your alert:\n\n${lines}\n\nUnsubscribe: ${unsubscribeUrl}`;
}

export async function sendJobAlertEmail(input: {
  to: string;
  matches: Job[];
  unsubscribeToken: string;
}): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/job-alerts/unsubscribe?token=${input.unsubscribeToken}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: "New job matches from Illora",
    html: jobAlertHtml(input.matches, unsubscribeUrl),
    text: jobAlertText(input.matches, unsubscribeUrl),
  });

  return { success: !error };
}

export type CampaignEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
};

export type CampaignAttachment = {
  filename: string;
  content: Buffer;
};

export type SendCampaignOptions = {
  replyTo?: string;
  attachment?: CampaignAttachment;
};

// Resend's batch endpoint caps each call at 100 emails. Permissive validation
// makes one malformed address fail only itself, not its whole chunk.
const CAMPAIGN_BATCH_SIZE = 100;

// Resend's batch API does not support attachments (only single-send does —
// see CreateBatchEmailOptions in the SDK types). When an attachment is
// present we fall back to one request per recipient; otherwise the fast
// batch path is used.
async function sendCampaignEmailsIndividually(
  emails: CampaignEmail[],
  options: SendCampaignOptions
): Promise<{ sentCount: number; failedCount: number }> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  let sentCount = 0;
  let failedCount = 0;

  for (const email of emails) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
        ...(options.attachment ? { attachments: [options.attachment] } : {}),
        headers: { "List-Unsubscribe": `<${email.unsubscribeUrl}>` },
      });

      if (error) {
        console.error(`sendCampaignEmails: send to ${email.to} failed`, error.message);
        failedCount++;
      } else {
        sentCount++;
      }
    } catch (err) {
      console.error(`sendCampaignEmails: send to ${email.to} threw`, err);
      failedCount++;
    }
  }

  return { sentCount, failedCount };
}

export async function sendCampaignEmails(
  emails: CampaignEmail[],
  options: SendCampaignOptions = {}
): Promise<{ sentCount: number; failedCount: number }> {
  if (options.attachment) {
    return sendCampaignEmailsIndividually(emails, options);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < emails.length; i += CAMPAIGN_BATCH_SIZE) {
    const chunk = emails.slice(i, i + CAMPAIGN_BATCH_SIZE);
    try {
      const { data, error } = await resend.batch.send(
        chunk.map((email) => ({
          from: FROM_EMAIL,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          ...(options.replyTo ? { replyTo: options.replyTo } : {}),
          headers: { "List-Unsubscribe": `<${email.unsubscribeUrl}>` },
        })),
        { batchValidation: "permissive" }
      );

      if (error || !data) {
        console.error(`sendCampaignEmails: batch of ${chunk.length} failed`, error?.message);
        failedCount += chunk.length;
      } else {
        sentCount += data.data.length;
        failedCount += chunk.length - data.data.length;
        for (const failure of data.errors ?? []) {
          console.error(`sendCampaignEmails: email at index ${i + failure.index} failed: ${failure.message}`);
        }
      }
    } catch (err) {
      // A thrown network/SDK error must not abort the remaining chunks.
      console.error(`sendCampaignEmails: batch of ${chunk.length} threw`, err);
      failedCount += chunk.length;
    }
  }

  return { sentCount, failedCount };
}

export async function sendCvConfirmationEmail(input: {
  to: string;
  name: string;
  jobTitle?: string;
}): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const roleLine = input.jobTitle ? ` for the ${input.jobTitle} role` : "";

  const html = `<p>Hi ${input.name},</p><p>Thanks for submitting your CV${roleLine}. A consultant will review your submission and be in touch within two business days, whether we have an immediate match or not.</p><p>— The Illora team</p>`;
  const text = `Hi ${input.name},\n\nThanks for submitting your CV${roleLine}. A consultant will review your submission and be in touch within two business days, whether we have an immediate match or not.\n\n— The Illora team`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: "CV received — Illora",
    html,
    text,
  });

  return { success: !error };
}

export async function sendVacancyConfirmationEmail(input: {
  to: string;
  contactName: string;
  companyName: string;
  roleTitle: string;
}): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `<p>Hi ${input.contactName},</p><p>Thanks for registering the ${input.roleTitle} vacancy at ${input.companyName}. A specialist consultant will be in touch within one business day to discuss next steps.</p><p>— The Illora team</p>`;
  const text = `Hi ${input.contactName},\n\nThanks for registering the ${input.roleTitle} vacancy at ${input.companyName}. A specialist consultant will be in touch within one business day to discuss next steps.\n\n— The Illora team`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: "Vacancy received — Illora",
    html,
    text,
  });

  return { success: !error };
}

export async function sendCapabilityStatementEmail(input: {
  to: string;
  name: string;
}): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/capability-statement-illora.pdf`;

  const html = `<p>Hi ${input.name},</p><p>Thanks for your interest in Illoura Services. You can download our capability statement here:</p><p><a href="${pdfUrl}">${pdfUrl}</a></p><p>A consultant may follow up to see if there's anything else we can help with.</p><p>— The Illoura team</p>`;
  const text = `Hi ${input.name},\n\nThanks for your interest in Illoura Services. You can download our capability statement here:\n${pdfUrl}\n\nA consultant may follow up to see if there's anything else we can help with.\n\n— The Illoura team`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: "Illoura Services — Capability Statement",
    html,
    text,
  });

  return { success: !error };
}

export async function sendContactConfirmationEmail(input: {
  to: string;
  name: string;
  subject: string;
}): Promise<{ success: boolean }> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `<p>Hi ${input.name},</p><p>Thanks for reaching out (${input.subject}). We've received your message and will be in touch within one business day.</p><p>— The Illora team</p>`;
  const text = `Hi ${input.name},\n\nThanks for reaching out (${input.subject}). We've received your message and will be in touch within one business day.\n\n— The Illora team`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: "Message received — Illora",
    html,
    text,
  });

  return { success: !error };
}
