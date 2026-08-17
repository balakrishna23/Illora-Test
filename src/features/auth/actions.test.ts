import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestPasswordReset, resetPassword, signIn, signOut, signUp } from "@/features/auth/actions";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { requireUser } from "@/server/auth/session";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/auth/supabase-server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireUser: vi.fn() }));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));

function mockSupabaseAuth(overrides: {
  signInWithPassword?: unknown;
  signUp?: unknown;
  signOut?: unknown;
  resetPasswordForEmail?: unknown;
  updateUser?: unknown;
}) {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(overrides.signInWithPassword ?? { error: null }),
      signUp: vi.fn().mockResolvedValue(overrides.signUp ?? { data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue(overrides.signOut ?? { error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue(overrides.resetPasswordForEmail ?? { error: null }),
      updateUser: vi.fn().mockResolvedValue(overrides.updateUser ?? { error: null }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

function formData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.set(key, value);
  return fd;
}

beforeEach(() => {
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("signIn", () => {
  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });

    const result = await signIn(null, formData({ email: "jane@example.com", password: "hunter2" }));

    expect(result?.success).toBe(false);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns field errors for an invalid email", async () => {
    mockSupabaseAuth({});

    const result = await signIn(null, formData({ email: "not-an-email", password: "hunter2" }));

    expect(result?.success).toBe(false);
    if (result && !result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("returns a generic error on invalid credentials, without leaking which field was wrong", async () => {
    mockSupabaseAuth({ signInWithPassword: { error: { message: "Invalid login credentials" } } });

    const result = await signIn(null, formData({ email: "jane@example.com", password: "wrong" }));

    expect(result).toEqual({ success: false, error: "Invalid email or password." });
  });

  it("redirects to /portal by default on success", async () => {
    mockSupabaseAuth({ signInWithPassword: { error: null } });

    await signIn(null, formData({ email: "jane@example.com", password: "hunter2" }));

    expect(redirect).toHaveBeenCalledWith("/portal");
  });

  it("redirects to the requested redirectTo on success", async () => {
    mockSupabaseAuth({ signInWithPassword: { error: null } });

    await signIn(
      null,
      formData({ email: "jane@example.com", password: "hunter2", redirectTo: "/jobs/some-role" })
    );

    expect(redirect).toHaveBeenCalledWith("/jobs/some-role");
  });
});

describe("signUp", () => {
  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });

    const result = await signUp(
      null,
      formData({ email: "jane@example.com", password: "password123", confirmPassword: "password123" })
    );

    expect(result?.success).toBe(false);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a field error when passwords don't match", async () => {
    const result = await signUp(
      null,
      formData({ email: "jane@example.com", password: "password123", confirmPassword: "different" })
    );

    expect(result?.success).toBe(false);
    if (result && !result.success) {
      expect(result.fieldErrors?.confirmPassword).toBeDefined();
    }
  });

  it("returns a field error for a too-short password", async () => {
    const result = await signUp(
      null,
      formData({ email: "jane@example.com", password: "short", confirmPassword: "short" })
    );

    expect(result?.success).toBe(false);
    if (result && !result.success) {
      expect(result.fieldErrors?.password).toBeDefined();
    }
  });

  it("returns a generic error when Supabase rejects the sign-up", async () => {
    mockSupabaseAuth({ signUp: { data: {}, error: { message: "boom" } } });

    const result = await signUp(
      null,
      formData({ email: "jane@example.com", password: "password123", confirmPassword: "password123" })
    );

    expect(result).toEqual({
      success: false,
      error: "Could not create your account. Please try again.",
    });
  });

  it("returns pendingConfirmation without redirecting when no session is returned", async () => {
    mockSupabaseAuth({ signUp: { data: { session: null }, error: null } });

    const result = await signUp(
      null,
      formData({ email: "jane@example.com", password: "password123", confirmPassword: "password123" })
    );

    expect(result).toEqual({ success: true, pendingConfirmation: true });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to /portal when sign-up returns an active session", async () => {
    mockSupabaseAuth({ signUp: { data: { session: { access_token: "t" } }, error: null } });

    await signUp(
      null,
      formData({ email: "jane@example.com", password: "password123", confirmPassword: "password123" })
    );

    expect(redirect).toHaveBeenCalledWith("/portal");
  });
});

describe("signOut", () => {
  it("signs out of Supabase and redirects home", async () => {
    mockSupabaseAuth({});

    await signOut();

    expect(redirect).toHaveBeenCalledWith("/");
  });
});

describe("requestPasswordReset", () => {
  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });

    const result = await requestPasswordReset(null, formData({ email: "jane@example.com" }));

    expect(result?.success).toBe(false);
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a field error for an invalid email", async () => {
    const result = await requestPasswordReset(null, formData({ email: "not-an-email" }));

    expect(result?.success).toBe(false);
    if (result && !result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("calls resetPasswordForEmail with a redirectTo pointed at /reset-password", async () => {
    mockSupabaseAuth({});

    await requestPasswordReset(null, formData({ email: "jane@example.com" }));

    const supabase = await createSupabaseServerClient();
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "jane@example.com",
      expect.objectContaining({ redirectTo: expect.stringContaining("/reset-password") })
    );
  });

  it("returns the same generic success whether or not the email is registered (no enumeration)", async () => {
    mockSupabaseAuth({ resetPasswordForEmail: { error: null } });
    const known = await requestPasswordReset(null, formData({ email: "known@example.com" }));

    mockSupabaseAuth({ resetPasswordForEmail: { error: null } });
    const unknown = await requestPasswordReset(null, formData({ email: "unknown@example.com" }));

    expect(known).toEqual({ success: true });
    expect(unknown).toEqual({ success: true });
  });

  it("still returns generic success even when Supabase errors (logged server-side only)", async () => {
    mockSupabaseAuth({ resetPasswordForEmail: { error: { message: "boom", name: "AuthApiError", status: 500 } } });

    const result = await requestPasswordReset(null, formData({ email: "jane@example.com" }));

    expect(result).toEqual({ success: true });
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockResolvedValue({ success: true, userId: "u1", email: "jane@example.com" });
  });

  it("rejects with a clear message when there's no valid recovery session", async () => {
    vi.mocked(requireUser).mockResolvedValue({ success: false, error: "You must be signed in to do that." });

    const result = await resetPassword(
      null,
      formData({ password: "newpassword123", confirmPassword: "newpassword123" })
    );

    expect(result).toEqual({
      success: false,
      error: "Your password reset link is invalid or has expired. Request a new one.",
    });
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });

    const result = await resetPassword(
      null,
      formData({ password: "newpassword123", confirmPassword: "newpassword123" })
    );

    expect(result?.success).toBe(false);
  });

  it("returns a field error when passwords don't match", async () => {
    const result = await resetPassword(
      null,
      formData({ password: "newpassword123", confirmPassword: "different" })
    );

    expect(result?.success).toBe(false);
    if (result && !result.success) {
      expect(result.fieldErrors?.confirmPassword).toBeDefined();
    }
  });

  it("does NOT require a current password field, unlike portal's changePassword", async () => {
    mockSupabaseAuth({});

    await resetPassword(null, formData({ password: "newpassword123", confirmPassword: "newpassword123" }));

    const supabase = await createSupabaseServerClient();
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "newpassword123" });
  });

  it("returns a typed error when Supabase rejects the update", async () => {
    mockSupabaseAuth({ updateUser: { error: { message: "weak password" } } });

    const result = await resetPassword(
      null,
      formData({ password: "newpassword123", confirmPassword: "newpassword123" })
    );

    expect(result).toEqual({ success: false, error: "Could not update your password. Please try again." });
  });

  it("redirects to /portal on success", async () => {
    mockSupabaseAuth({ updateUser: { error: null } });

    await resetPassword(null, formData({ password: "newpassword123", confirmPassword: "newpassword123" }));

    expect(redirect).toHaveBeenCalledWith("/portal");
  });
});
