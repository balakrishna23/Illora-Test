"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/server/auth/supabase-server";
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
  });

  if (error) {
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
