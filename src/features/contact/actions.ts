"use server";

import { z } from "zod";

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
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Stub: route to correct distribution list via Resend
  // const toEmail = { "General Enquiry": "hello@illora.com.au", "Employer Enquiry": "employers@illora.com.au", ... }[parsed.data.subject];
  // await resend.emails.send({ to: toEmail, subject: `[${parsed.data.subject}] from ${parsed.data.name}`, ... });

  return { success: true };
}
