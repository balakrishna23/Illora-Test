"use server";

import { z } from "zod";

import { JOB_INDUSTRIES } from "@/server/integrations/jobadder";

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
  const raw = Object.fromEntries(formData.entries());
  const parsed = vacancySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Stub: write to DB, push to JobAdder, send Resend email
  // await db.insert(vacancyLeads).values(parsed.data);
  // await jobadderClient.createJob(parsed.data);
  // await resend.emails.send({ ... });

  return { success: true };
}
