"use server";

import { z } from "zod";

import { db } from "@/server/db/client";
import { applications, securityClearanceValues } from "@/server/db/schema";
import { requireUser } from "@/server/auth/session";
import { getOrCreateCandidate } from "@/features/portal/queries";
import {
  existsApplicationForEmail,
  findExistingApplicationForCandidate,
  replaceApplication,
} from "@/features/candidates/queries";
import { isBotSubmission } from "@/lib/honeypot";
import { checkRateLimit, retryAfterMessage } from "@/server/lib/rate-limit-guard";
import { JOB_INDUSTRIES } from "@/server/integrations/jobadder";
import { createPresignedUploadUrl, deleteObject, getObjectSize } from "@/server/integrations/r2";
import { sendCvConfirmationEmail } from "@/server/integrations/resend";

const submitCvSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Valid phone number required"),
  targetIndustry: z.enum(JOB_INDUSTRIES),
  currentRole: z.string().min(2, "Current role/title is required"),
  linkedIn: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  securityClearance: z.enum(securityClearanceValues),
  resumeKey: z.string().min(1, "Resume upload is required"),
  consent: z.literal("on", { error: "You must consent to proceed" }),
  marketingConsent: z.preprocess((v) => v === "on", z.boolean()),
  jobId: z.string().uuid().optional().or(z.literal("")),
  jobSlug: z.string().optional(),
  jobTitle: z.string().optional(),
});

export type SubmitCvState =
  | { success: true; replaced?: boolean }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

const MAX_FILE_BYTES = 5 * 1024 * 1024;
// Matches the key shape getR2UploadUrl generates: resumes/<timestamp>-<sanitized-filename>
const R2_KEY_PATTERN = /^resumes\/\d+-[a-zA-Z0-9._-]+\.(pdf|docx)$/i;

// A presigned PUT can't enforce a size cap at upload time (the file goes
// browser→R2 directly, and R2 doesn't support presigned POST policies), so
// the submission is the enforcement point: confirm the object really exists
// and is within the limit before accepting the application.
async function validateUploadedFile(key: string): Promise<string | null> {
  if (!R2_KEY_PATTERN.test(key)) {
    return "File upload is invalid — please re-upload the file.";
  }

  const size = await getObjectSize(key);
  if (size === null) {
    return "File upload did not complete — please re-upload the file.";
  }

  if (size > MAX_FILE_BYTES) {
    try {
      await deleteObject(key);
    } catch (error) {
      console.error("submitCv: failed to delete oversized upload", key, error);
    }
    return "File is over the 5 MB limit — please upload a smaller file.";
  }

  return null;
}

export async function submitCv(
  _prev: SubmitCvState | null,
  formData: FormData
): Promise<SubmitCvState> {
  // Silently accept bot submissions without persisting or emailing.
  if (isBotSubmission(formData)) return { success: true };

  const rate = await checkRateLimit("submitCv");
  if (!rate.ok) {
    return { success: false, error: `Too many submissions. ${retryAfterMessage(rate.retryAfterSeconds)}` };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = submitCvSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const {
    resumeKey,
    consent: _consent,
    jobId,
    jobSlug,
    jobTitle,
    ...candidateData
  } = parsed.data;
  void _consent;

  const resumeError = await validateUploadedFile(resumeKey);
  if (resumeError) {
    return {
      success: false,
      error: "There is a problem with an uploaded file.",
      fieldErrors: { resumeKey: [resumeError] },
    };
  }

  // Non-fatal: link the submission to a candidate record when the
  // submitter is signed in, so it also surfaces in their portal. Anonymous
  // submissions (candidateId null) are still fully visible to admins.
  const session = await requireUser();
  const candidateId = session.success
    ? (await getOrCreateCandidate(session.userId, session.email)).id
    : null;

  let replaced = false;
  if (candidateId && session.success) {
    // One application per candidate per job (and one general CV submission):
    // resubmitting replaces the existing one instead of creating a duplicate.
    const existing = await findExistingApplicationForCandidate(
      candidateId,
      session.email,
      jobId || null
    );

    if (existing) {
      await replaceApplication(existing.id, candidateId, {
        ...candidateData,
        resumeR2Key: resumeKey,
      });

      // Best-effort cleanup of the superseded resume — an orphaned object in
      // the bucket is not worth failing the submission over.
      if (existing.resumeR2Key && existing.resumeR2Key !== resumeKey) {
        try {
          await deleteObject(existing.resumeR2Key);
        } catch (error) {
          console.error("submitCv: failed to delete replaced R2 object", existing.resumeR2Key, error);
        }
      }
      replaced = true;
    }
  } else if (await existsApplicationForEmail(candidateData.email, jobId || null)) {
    // Anonymous resubmission with a known email is blocked rather than
    // replaced — otherwise anyone who knows an email could overwrite that
    // person's resume without proving they own the address.
    return {
      success: false,
      error:
        "We already have a CV on file for this email address. Sign in to your account to update your resume.",
    };
  }

  if (!replaced) {
    await db.insert(applications).values({
      ...candidateData,
      candidateId,
      jobId: jobId || null,
      jobSlug: jobSlug || null,
      jobTitle: jobTitle || null,
      resumeR2Key: resumeKey,
    });
  }

  // Non-fatal: the application is already saved — an email hiccup shouldn't
  // block a submission the user already saw confirmed in the UI.
  try {
    await sendCvConfirmationEmail({
      to: candidateData.email,
      name: candidateData.name,
      jobTitle: jobTitle || undefined,
    });
  } catch (error) {
    console.error("submitCv: failed to send confirmation email", error);
  }

  return { success: true, replaced };
}

const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function getR2UploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  // Higher ceiling than form submits — a single applicant may re-pick a file
  // a few times — but still bounded to stop scripted bucket-spam.
  const rate = await checkRateLimit("getR2UploadUrl", { limit: 20 });
  if (!rate.ok) {
    throw new Error("Too many upload attempts. Please wait a moment and try again.");
  }

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error("Only PDF or DOCX files are accepted.");
  }

  // Client-side validation is bypassable — re-check the extension server-side too.
  if (!/\.(pdf|docx)$/i.test(filename)) {
    throw new Error("Only PDF or DOCX files are accepted.");
  }

  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `resumes/${Date.now()}-${safeFilename}`;

  const { uploadUrl } = await createPresignedUploadUrl({ key, contentType });

  return { uploadUrl, key };
}
