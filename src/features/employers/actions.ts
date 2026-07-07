"use server";

import { z } from "zod";

import { db } from "@/server/db/client";
import { vacancyRequests } from "@/server/db/schema";
import { isBotSubmission } from "@/lib/honeypot";
import { JOB_INDUSTRIES } from "@/server/integrations/jobadder";
import { sendVacancyConfirmationEmail } from "@/server/integrations/resend";

const vacancySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Valid phone number required"),
  roleTitle: z.string().min(2, "Role title is required"),
  employmentType: z.enum(["Permanent", "Contract", "Casual"]),
  location: z.string().min(2, "Location is required"),
  industry: z.enum(JOB_INDUSTRIES),
  urgency: z.enum(["ASAP", "Within 2 weeks", "Within a month", "No rush"]),
  message: z.string().min(10, "Please provide some detail about the role"),
  serviceType: z.string().optional(),
});

export type VacancyFormState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerVacancy(
  _prev: VacancyFormState | null,
  formData: FormData
): Promise<VacancyFormState> {
  // Silently accept bot submissions without persisting or emailing.
  if (isBotSubmission(formData)) return { success: true };

  const raw = Object.fromEntries(formData.entries());
  const parsed = vacancySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(vacancyRequests).values(parsed.data);

  try {
    await sendVacancyConfirmationEmail({
      to: parsed.data.email,
      contactName: parsed.data.contactName,
      companyName: parsed.data.companyName,
      roleTitle: parsed.data.roleTitle,
    });
  } catch (error) {
    console.error("registerVacancy: failed to send confirmation email", error);
  }

  return { success: true };
}
