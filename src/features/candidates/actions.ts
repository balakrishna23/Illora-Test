"use server";

import { z } from "zod";

import { JOB_INDUSTRIES } from "@/server/integrations/jobadder";

const submitCvSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Valid phone number required"),
  targetIndustry: z.enum(JOB_INDUSTRIES),
  currentRole: z.string().min(2, "Current role/title is required"),
  linkedIn: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  resumeKey: z.string().min(1, "Resume upload is required"),
  coverLetterKey: z.string().optional(),
  consent: z.literal("on", { error: "You must consent to proceed" }),
});

export type SubmitCvState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitCv(
  _prev: SubmitCvState | null,
  formData: FormData
): Promise<SubmitCvState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = submitCvSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Stub: store metadata in DB, push to JobAdder, send Resend confirmation email
  // const { resumeKey, coverLetterKey, ...candidateData } = parsed.data;
  // await db.insert(candidateSubmissions).values({ ...candidateData, resumeR2Key: resumeKey });
  // await jobadderClient.createCandidate(parsed.data);
  // await resend.emails.send({ to: parsed.data.email, subject: "CV received — Illora", ... });

  return { success: true };
}

export async function getR2UploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  void contentType; // stub — used by real R2 presigned URL generation
  const key = `resumes/${Date.now()}-${filename}`;
  return { uploadUrl: `/api/upload-stub?key=${key}`, key };
}
