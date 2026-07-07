"use server";

import { z } from "zod";

import { db } from "@/server/db/client";
import { contactMessages } from "@/server/db/schema";
import { isBotSubmission } from "@/lib/honeypot";
import { checkRateLimit, retryAfterMessage } from "@/server/lib/rate-limit-guard";
import { sendContactConfirmationEmail } from "@/server/integrations/resend";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.enum(["General Enquiry", "Employer Enquiry", "Candidate Enquiry", "Media"]),
  message: z.string().min(10, "Please provide some detail"),
});

export type ContactFormState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function sendContactMessage(
  _prev: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  // Silently accept bot submissions without persisting or emailing.
  if (isBotSubmission(formData)) return { success: true };

  const rate = await checkRateLimit("sendContactMessage");
  if (!rate.ok) {
    return { success: false, error: `Too many messages. ${retryAfterMessage(rate.retryAfterSeconds)}` };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(contactMessages).values(parsed.data);

  try {
    await sendContactConfirmationEmail({
      to: parsed.data.email,
      name: parsed.data.name,
      subject: parsed.data.subject,
    });
  } catch (error) {
    console.error("sendContactMessage: failed to send confirmation email", error);
  }

  return { success: true };
}
