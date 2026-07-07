import { Resend } from "resend";

import type { Job } from "@/server/integrations/jobadder";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "alerts@illora.com.au";

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
