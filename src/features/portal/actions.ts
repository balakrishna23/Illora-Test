"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/server/auth/session";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { checkRateLimit, retryAfterMessage } from "@/server/lib/rate-limit-guard";
import {
  getOrCreateCandidate,
  isJobSaved,
  removeSavedJob,
  saveJob,
} from "@/features/portal/queries";
import type { ToggleSaveJobState } from "@/features/portal/types";

const toggleSaveJobSchema = z.object({
  jobId: z.string().min(1),
  jobSlug: z.string().min(1),
  jobTitle: z.string().min(1),
});

export async function toggleSaveJob(
  jobId: string,
  jobSlug: string,
  jobTitle: string
): Promise<ToggleSaveJobState> {
  const session = await requireUser();
  if (!session.success) {
    return { success: false, error: session.error };
  }

  const parsed = toggleSaveJobSchema.safeParse({ jobId, jobSlug, jobTitle });
  if (!parsed.success) {
    return { success: false, error: "Invalid job." };
  }

  const candidate = await getOrCreateCandidate(session.userId, session.email);
  const alreadySaved = await isJobSaved(candidate.id, parsed.data.jobId);

  if (alreadySaved) {
    await removeSavedJob(candidate.id, parsed.data.jobId);
  } else {
    await saveJob(candidate.id, {
      id: parsed.data.jobId,
      slug: parsed.data.jobSlug,
      title: parsed.data.jobTitle,
    });
  }

  revalidatePath("/portal");

  return { success: true, saved: !alreadySaved };
}

export type AccountActionState =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | null;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const session = await requireUser();
  if (!session.success) return { success: false, error: session.error };

  const rate = await checkRateLimit("changePassword", { limit: 5 });
  if (!rate.ok) {
    return {
      success: false,
      error: `Too many attempts. ${retryAfterMessage(rate.retryAfterSeconds)}`,
    };
  }

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();

  // Supabase's updateUser() doesn't require the current password — re-verify
  // it here as defense-in-depth before allowing the change.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: session.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) {
    return {
      success: false,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) {
    return { success: false, error: "Could not update your password. Please try again." };
  }

  return { success: true, message: "Your password has been updated." };
}

const changeEmailSchema = z.object({
  newEmail: z.string().email("Valid email required"),
});

export async function changeEmail(
  _prev: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const session = await requireUser();
  if (!session.success) return { success: false, error: session.error };

  const rate = await checkRateLimit("changeEmail", { limit: 5 });
  if (!rate.ok) {
    return {
      success: false,
      error: `Too many attempts. ${retryAfterMessage(rate.retryAfterSeconds)}`,
    };
  }

  const parsed = changeEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ email: parsed.data.newEmail });
  if (error) {
    return { success: false, error: "Could not update your email. Please try again." };
  }

  return {
    success: true,
    message: `Check ${parsed.data.newEmail} for a confirmation link to finish the change.`,
  };
}
