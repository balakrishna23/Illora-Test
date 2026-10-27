"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import { jobs } from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";
import { AU_STATES, JOB_INDUSTRIES, JOB_TYPES } from "@/server/integrations/jobadder";

function listField() {
  return z
    .string()
    .transform((val) =>
      val
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    );
}

const jobFormSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  title: z.string().min(2, "Title is required"),
  location: z.string().min(2, "Location is required"),
  state: z.enum(AU_STATES),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  type: z.enum(JOB_TYPES),
  industry: z.enum(JOB_INDUSTRIES),
  salaryRange: z.string().optional().or(z.literal("")),
  postedDate: z.string().min(1, "Posted date is required"),
  closingDate: z.string().min(1, "Closing date is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  teaser: z.string().min(10, "Teaser is required"),
  description: z.string().min(10, "Description is required"),
  responsibilities: listField(),
  requirements: listField(),
  benefits: listField(),
});

export type JobFormState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireAdminOrError(): Promise<{ error: string } | null> {
  const session = await requireAdmin();
  return session.success ? null : { error: session.error };
}

export async function createJob(
  _prev: JobFormState | null,
  formData: FormData
): Promise<JobFormState> {
  const denied = await requireAdminOrError();
  if (denied) return { success: false, error: denied.error };

  const parsed = jobFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.insert(jobs).values({ ...parsed.data, salaryRange: parsed.data.salaryRange || null });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");

  return { success: true };
}

export async function updateJob(
  id: string,
  _prev: JobFormState | null,
  formData: FormData
): Promise<JobFormState> {
  const denied = await requireAdminOrError();
  if (denied) return { success: false, error: denied.error };

  const parsed = jobFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db
    .update(jobs)
    .set({
      ...parsed.data,
      salaryRange: parsed.data.salaryRange || null,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id));

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${parsed.data.slug}`);

  return { success: true };
}

export async function closeJob(id: string): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  await db.update(jobs).set({ status: "closed", updatedAt: new Date() }).where(eq(jobs.id, id));

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");

  return { success: true };
}

// Publishes an ingested job (features/job-ingestion) to the public /jobs
// listing. Native "illoura" jobs never pass through "pending", so this only
// ever applies to externally-sourced rows.
export async function approveJob(id: string): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  await db.update(jobs).set({ status: "active", updatedAt: new Date() }).where(eq(jobs.id, id));

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");

  return { success: true };
}

export async function rejectJob(id: string): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  await db.update(jobs).set({ status: "rejected", updatedAt: new Date() }).where(eq(jobs.id, id));

  revalidatePath("/admin/jobs");

  return { success: true };
}

export async function deleteJob(id: string): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  await db.delete(jobs).where(eq(jobs.id, id));

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");

  return { success: true };
}
