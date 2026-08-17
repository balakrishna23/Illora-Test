"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { requireUser } from "@/server/auth/session";
import { checkRateLimit, retryAfterMessage } from "@/server/lib/rate-limit-guard";

const signInSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
  redirectTo: z.string().optional(),
});

export type SignInState =
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | null;

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const rate = await checkRateLimit("signIn", { limit: 10 });
  if (!rate.ok) {
    return {
      success: false,
      error: `Too many attempts. ${retryAfterMessage(rate.retryAfterSeconds)}`,
    };
  }

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Logged server-side only — status/name (e.g. AuthRetryableFetchError,
    // 500) point at SMTP/provider failures that "Invalid email or password"
    // deliberately hides from the client.
    console.error("signIn: Supabase auth error", {
      name: error.name,
      status: error.status,
      message: error.message,
    });
    return { success: false, error: "Invalid email or password." };
  }

  redirect(parsed.data.redirectTo || "/portal");
}

const signUpSchema = z
  .object({
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpState =
  | { success: true; pendingConfirmation: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | null;

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const rate = await checkRateLimit("signUp", { limit: 5 });
  if (!rate.ok) {
    return {
      success: false,
      error: `Too many attempts. ${retryAfterMessage(rate.retryAfterSeconds)}`,
    };
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal` },
  });

  if (error) {
    // Logged server-side only — this is the one place that would have shown
    // AuthRetryableFetchError/500 from a custom-SMTP send failure without
    // needing a separate direct-API test to see it.
    console.error("signUp: Supabase auth error", {
      name: error.name,
      status: error.status,
      message: error.message,
    });
    return { success: false, error: "Could not create your account. Please try again." };
  }

  // With email confirmation on, sign-up never returns a session — including
  // for an already-registered email, which Supabase deliberately returns as
  // a look-alike success (not an error) to avoid leaking which emails exist.
  // Showing the same "check your email" message either way preserves that.
  if (data.session) {
    redirect("/portal");
  }

  return { success: true, pendingConfirmation: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

const requestPasswordResetSchema = z.object({
  email: z.string().email("Valid email required"),
});

export type RequestPasswordResetState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | null;

// No auth required — this is the entry point for someone who's locked out.
// Always returns the same "check your email" result regardless of whether
// the address has an account (Supabase's resetPasswordForEmail itself
// doesn't error for an unknown email, for the same reason signUp above
// doesn't distinguish an already-registered email — avoids leaking which
// addresses exist).
export async function requestPasswordReset(
  _prev: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const rate = await checkRateLimit("requestPasswordReset", { limit: 5 });
  if (!rate.ok) {
    return {
      success: false,
      error: `Too many attempts. ${retryAfterMessage(rate.retryAfterSeconds)}`,
    };
  }

  const parsed = requestPasswordResetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) {
    console.error("requestPasswordReset: Supabase auth error", {
      name: error.name,
      status: error.status,
      message: error.message,
    });
    // Still generic — an error here is almost always the same custom-SMTP/
    // hook-side failure class this whole flow was built to avoid, and even
    // so, revealing it would risk confirming whether the email is registered.
  }

  return { success: true };
}

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | null;

// Only reachable with a valid session — arriving here happens exclusively
// via /auth/confirm verifying a recovery-type token, which establishes a
// (short-lived, recovery-scoped) session as a side effect. No "current
// password" check, unlike portal/actions.ts's changePassword — proving you
// clicked the emailed link *is* the re-authentication here.
export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const session = await requireUser();
  if (!session.success) {
    return {
      success: false,
      error: "Your password reset link is invalid or has expired. Request a new one.",
    };
  }

  const rate = await checkRateLimit("resetPassword", { limit: 5 });
  if (!rate.ok) {
    return {
      success: false,
      error: `Too many attempts. ${retryAfterMessage(rate.retryAfterSeconds)}`,
    };
  }

  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    console.error("resetPassword: Supabase auth error", {
      name: error.name,
      status: error.status,
      message: error.message,
    });
    return { success: false, error: "Could not update your password. Please try again." };
  }

  redirect("/portal");
}
