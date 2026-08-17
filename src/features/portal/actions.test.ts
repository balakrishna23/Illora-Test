import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  changeEmail,
  changePassword,
  toggleSaveJob,
} from "@/features/portal/actions";
import { requireUser } from "@/server/auth/session";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import {
  getOrCreateCandidate,
  isJobSaved,
  removeSavedJob,
  saveJob,
} from "@/features/portal/queries";

const {
  revalidatePath,
  signInWithPassword,
  updateUser,
} = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/server/auth/session", () => ({ requireUser: vi.fn() }));
vi.mock("@/server/auth/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));
vi.mock("@/features/portal/queries", () => ({
  getOrCreateCandidate: vi.fn(),
  isJobSaved: vi.fn(),
  removeSavedJob: vi.fn(),
  saveJob: vi.fn(),
}));

const USER = {
  success: true,
  userId: "user-1",
  email: "candidate@example.com",
} as const;

function passwordFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults = {
    currentPassword: "old-password-123",
    newPassword: "new-password-123",
    confirmPassword: "new-password-123",
    ...overrides,
  };
  for (const [key, value] of Object.entries(defaults)) {
    fd.set(key, value);
  }
  return fd;
}

function emailFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("newEmail", overrides.newEmail ?? "new@example.com");
  return fd;
}

describe("toggleSaveJob", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockResolvedValue({ ...USER });
    vi.mocked(getOrCreateCandidate).mockResolvedValue({ id: "candidate-1" } as never);
    vi.mocked(isJobSaved).mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    vi.mocked(requireUser).mockResolvedValue({ success: false, error: "You must be signed in." });

    const result = await toggleSaveJob("job-1", "job-1", "Engineer");

    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(saveJob).not.toHaveBeenCalled();
    expect(removeSavedJob).not.toHaveBeenCalled();
  });

  it("rejects invalid job input", async () => {
    const result = await toggleSaveJob("", "job-1", "Engineer");

    expect(result).toEqual({ success: false, error: "Invalid job." });
    expect(getOrCreateCandidate).not.toHaveBeenCalled();
  });

  it("saves a job that is not already saved", async () => {
    const result = await toggleSaveJob("job-1", "software-engineer", "Software Engineer");

    expect(result).toEqual({ success: true, saved: true });
    expect(saveJob).toHaveBeenCalledWith("candidate-1", {
      id: "job-1",
      slug: "software-engineer",
      title: "Software Engineer",
    });
    expect(removeSavedJob).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/portal");
  });

  it("removes a job that is already saved", async () => {
    vi.mocked(isJobSaved).mockResolvedValue(true);

    const result = await toggleSaveJob("job-1", "software-engineer", "Software Engineer");

    expect(result).toEqual({ success: true, saved: false });
    expect(removeSavedJob).toHaveBeenCalledWith("candidate-1", "job-1");
    expect(saveJob).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/portal");
  });
});

describe("changePassword", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockResolvedValue({ ...USER });
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        signInWithPassword,
        updateUser,
      },
    } as never);
    signInWithPassword.mockResolvedValue({ error: null });
    updateUser.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    vi.mocked(requireUser).mockResolvedValue({ success: false, error: "You must be signed in." });

    const result = await changePassword(null, passwordFormData());

    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const result = await changePassword(
      null,
      passwordFormData({ currentPassword: "", confirmPassword: "different-password" })
    );

    expect(result?.success).toBe(false);
    if (result?.success === false) {
      expect(result.fieldErrors?.currentPassword).toBeTruthy();
      expect(result.fieldErrors?.confirmPassword).toBeTruthy();
    }
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });

    const result = await changePassword(null, passwordFormData());

    expect(result).toEqual({
      success: false,
      error: "Too many attempts. Please try again later.",
    });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns a field error when the current password is wrong", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });

    const result = await changePassword(null, passwordFormData());

    expect(result).toEqual({
      success: false,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("returns a typed error when Supabase rejects the update", async () => {
    updateUser.mockResolvedValue({ error: { message: "weak password" } });

    const result = await changePassword(null, passwordFormData());

    expect(result).toEqual({
      success: false,
      error: "Could not update your password. Please try again.",
    });
  });

  it("re-authenticates and updates the password on success", async () => {
    const result = await changePassword(null, passwordFormData());

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "candidate@example.com",
      password: "old-password-123",
    });
    expect(updateUser).toHaveBeenCalledWith({ password: "new-password-123" });
    expect(result).toEqual({
      success: true,
      message: "Your password has been updated.",
    });
  });
});

describe("changeEmail", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockResolvedValue({ ...USER });
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        updateUser,
      },
    } as never);
    updateUser.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    vi.mocked(requireUser).mockResolvedValue({ success: false, error: "You must be signed in." });

    const result = await changeEmail(null, emailFormData());

    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("returns field errors for an invalid email", async () => {
    const result = await changeEmail(null, emailFormData({ newEmail: "not-an-email" }));

    expect(result?.success).toBe(false);
    if (result?.success === false) {
      expect(result.fieldErrors?.newEmail).toBeTruthy();
    }
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });

    const result = await changeEmail(null, emailFormData());

    expect(result).toEqual({
      success: false,
      error: "Too many attempts. Please try again later.",
    });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("returns a typed error when Supabase rejects the email change", async () => {
    updateUser.mockResolvedValue({ error: { message: "email exists" } });

    const result = await changeEmail(null, emailFormData());

    expect(result).toEqual({
      success: false,
      error: "Could not update your email. Please try again.",
    });
  });

  it("requests the email change and returns the confirmation message", async () => {
    const result = await changeEmail(null, emailFormData({ newEmail: "updated@example.com" }));

    expect(updateUser).toHaveBeenCalledWith({ email: "updated@example.com" });
    expect(result).toEqual({
      success: true,
      message: "Check updated@example.com for a confirmation link to finish the change.",
    });
  });
});
