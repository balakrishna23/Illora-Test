"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import { applicationStatusValues, applications } from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";
import { createPresignedDownloadUrl } from "@/server/integrations/r2";

const statusSchema = z.enum(applicationStatusValues);

type ResumeUrlResult =
  | { success: true; downloadUrl: string }
  | { success: false; error: string };

// Admin-only: returns a short-lived presigned URL to a candidate's resume.
// The R2 key is never exposed to the client — it's looked up server-side from
// the application id and signed here, so only an authenticated admin can pull
// a link, and that link expires in ~2 minutes.
export async function getResumeDownloadUrl(
  kind: "resume" | "coverLetter",
  applicationId: string
): Promise<ResumeUrlResult> {
  const session = await requireAdmin();
  if (!session.success) return { success: false, error: session.error };

  if (!z.string().uuid().safeParse(applicationId).success) {
    return { success: false, error: "Invalid application." };
  }

  const [application] = await db
    .select({
      name: applications.name,
      resumeR2Key: applications.resumeR2Key,
      coverLetterR2Key: applications.coverLetterR2Key,
    })
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!application) return { success: false, error: "Application not found." };

  const key = kind === "resume" ? application.resumeR2Key : application.coverLetterR2Key;
  if (!key) return { success: false, error: "No file on file for this candidate." };

  const safeName = application.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  const extension = key.split(".").pop()?.toLowerCase() === "docx" ? "docx" : "pdf";
  const label = kind === "resume" ? "resume" : "cover-letter";

  try {
    const { downloadUrl } = await createPresignedDownloadUrl({
      key,
      downloadFilename: `${safeName || "candidate"}-${label}.${extension}`,
    });
    return { success: true, downloadUrl };
  } catch (error) {
    console.error("getResumeDownloadUrl: failed to sign URL", error);
    return { success: false, error: "Could not generate a download link. Please try again." };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: string
): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { success: false };

  await db
    .update(applications)
    .set({ status: parsed.data, updatedAt: new Date() })
    .where(eq(applications.id, id));

  revalidatePath("/admin/applications");

  return { success: true };
}
