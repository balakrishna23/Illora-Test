import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getResumeUploadUrl, parseUploadedResume, submitCv } from "@/features/candidates/actions";
import { requireUser } from "@/server/auth/session";
import { getOrCreateCandidate } from "@/features/portal/queries";
import {
  existsApplicationForEmail,
  findExistingApplicationForCandidate,
  replaceApplication,
} from "@/features/candidates/queries";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import {
  createPresignedUploadUrl,
  deleteObject,
  getObjectSize,
} from "@/server/integrations/supabase-storage";
import { parseResumeFromStorage } from "@/server/integrations/resume-parser";
import { sendCvConfirmationEmail } from "@/server/integrations/resend";

const insertValues = vi.fn();
vi.mock("@/server/db/client", () => ({
  db: { insert: vi.fn(() => ({ values: insertValues })) },
}));
vi.mock("@/server/auth/session", () => ({ requireUser: vi.fn() }));
vi.mock("@/features/portal/queries", () => ({ getOrCreateCandidate: vi.fn() }));
vi.mock("@/features/candidates/queries", () => ({
  existsApplicationForEmail: vi.fn(),
  findExistingApplicationForCandidate: vi.fn(),
  replaceApplication: vi.fn(),
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));
vi.mock("@/server/integrations/supabase-storage", () => ({
  createPresignedUploadUrl: vi.fn(),
  deleteObject: vi.fn(),
  getObjectSize: vi.fn(),
}));
vi.mock("@/server/integrations/resume-parser", () => ({
  parseResumeFromStorage: vi.fn(),
}));
vi.mock("@/server/integrations/resend", () => ({
  sendCvConfirmationEmail: vi.fn(),
}));

function cvFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    name: "Jane Candidate",
    email: "jane@example.com",
    phone: "0400000000",
    targetIndustry: "AI Engineering",
    currentRole: "Engineer",
    securityClearance: "None",
    resumeKey: "resumes/1700000000000-resume.pdf",
    consent: "on",
    marketingConsent: "on",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitCv", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(getObjectSize).mockResolvedValue(1024);
    vi.mocked(requireUser).mockResolvedValue({ success: false, error: "You must be signed in to do that." });
    vi.mocked(existsApplicationForEmail).mockResolvedValue(false);
    vi.mocked(sendCvConfirmationEmail).mockResolvedValue({ success: true });
    insertValues.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("silently accepts a bot submission without touching rate limiting or the db", async () => {
    const fd = cvFormData({ contactFax: "http://spam.example" });

    const result = await submitCv(null, fd);

    expect(result).toEqual({ success: true });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 30 });

    const result = await submitCv(null, cvFormData());

    expect(result.success).toBe(false);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const result = await submitCv(null, cvFormData({ email: "not-an-email" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("rejects a resumeKey that doesn't match the upload key pattern", async () => {
    const result = await submitCv(null, cvFormData({ resumeKey: "not-a-real-key" }));

    expect(result).toEqual({
      success: false,
      error: "There is a problem with an uploaded file.",
      fieldErrors: { resumeKey: ["File upload is invalid — please re-upload the file."] },
    });
    expect(getObjectSize).not.toHaveBeenCalled();
  });

  it("rejects when the uploaded object can't be found (upload never completed)", async () => {
    vi.mocked(getObjectSize).mockResolvedValue(null);

    const result = await submitCv(null, cvFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.resumeKey?.[0]).toMatch(/did not complete/);
    }
  });

  it("deletes and rejects an oversized upload", async () => {
    vi.mocked(getObjectSize).mockResolvedValue(6 * 1024 * 1024);

    const result = await submitCv(null, cvFormData());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.resumeKey?.[0]).toMatch(/5 MB limit/);
    }
    expect(deleteObject).toHaveBeenCalledWith("resumes/1700000000000-resume.pdf");
  });

  it("blocks an anonymous resubmission when the email already has an application on file", async () => {
    vi.mocked(existsApplicationForEmail).mockResolvedValue(true);

    const result = await submitCv(null, cvFormData());

    expect(result).toEqual({
      success: false,
      error:
        "We already have a CV on file for this email address. Sign in to your account to update your resume.",
    });
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("inserts a new application for a first-time anonymous submission and emails a confirmation", async () => {
    const result = await submitCv(null, cvFormData());

    expect(result).toEqual({ success: true, replaced: false });
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com", candidateId: null })
    );
    expect(sendCvConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "jane@example.com" })
    );
  });

  it("replaces an existing application for a signed-in candidate and cleans up the old resume", async () => {
    vi.mocked(requireUser).mockResolvedValue({ success: true, userId: "u1", email: "jane@example.com" });
    vi.mocked(getOrCreateCandidate).mockResolvedValue({ id: "cand-1" } as never);
    vi.mocked(findExistingApplicationForCandidate).mockResolvedValue({
      id: "app-1",
      resumeStorageKey: "resumes/old-key.pdf",
    } as never);

    const result = await submitCv(null, cvFormData());

    expect(result).toEqual({ success: true, replaced: true });
    expect(replaceApplication).toHaveBeenCalledWith(
      "app-1",
      "cand-1",
      expect.objectContaining({ resumeStorageKey: "resumes/1700000000000-resume.pdf" })
    );
    expect(deleteObject).toHaveBeenCalledWith("resumes/old-key.pdf");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("does not delete the old resume when re-submitting with the same file", async () => {
    vi.mocked(requireUser).mockResolvedValue({ success: true, userId: "u1", email: "jane@example.com" });
    vi.mocked(getOrCreateCandidate).mockResolvedValue({ id: "cand-1" } as never);
    vi.mocked(findExistingApplicationForCandidate).mockResolvedValue({
      id: "app-1",
      resumeStorageKey: "resumes/1700000000000-resume.pdf",
    } as never);

    await submitCv(null, cvFormData());

    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("still succeeds when the confirmation email fails to send (non-fatal)", async () => {
    vi.mocked(sendCvConfirmationEmail).mockRejectedValue(new Error("resend down"));

    const result = await submitCv(null, cvFormData());

    expect(result.success).toBe(true);
  });
});

describe("getResumeUploadUrl", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(createPresignedUploadUrl).mockResolvedValue({ uploadUrl: "https://storage.example/put" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throws when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 10 });

    await expect(getResumeUploadUrl("resume.pdf", "application/pdf")).rejects.toThrow(
      /Too many upload attempts/
    );
  });

  it("throws for a disallowed content type", async () => {
    await expect(getResumeUploadUrl("resume.pdf", "image/png")).rejects.toThrow(
      "Only PDF or DOCX files are accepted."
    );
  });

  it("throws when the filename extension doesn't match an allowed type", async () => {
    await expect(getResumeUploadUrl("resume.exe", "application/pdf")).rejects.toThrow(
      "Only PDF or DOCX files are accepted."
    );
  });

  it("signs an upload URL with a sanitized, timestamped key", async () => {
    const result = await getResumeUploadUrl("resume final.pdf", "application/pdf");

    expect(result.uploadUrl).toBe("https://storage.example/put");
    expect(result.key).toMatch(/^resumes\/\d+-resume_final\.pdf$/);
  });
});

describe("parseUploadedResume", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns failure when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 10 });

    const result = await parseUploadedResume("resumes/1-a.pdf");

    expect(result).toEqual({ success: false });
    expect(parseResumeFromStorage).not.toHaveBeenCalled();
  });

  it("returns failure for a key that doesn't match the upload pattern", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });

    const result = await parseUploadedResume("not-a-real-key");

    expect(result).toEqual({ success: false });
    expect(parseResumeFromStorage).not.toHaveBeenCalled();
  });

  it("returns failure when nothing confident was extracted", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(parseResumeFromStorage).mockResolvedValue({});

    const result = await parseUploadedResume("resumes/1-a.pdf");

    expect(result).toEqual({ success: false });
  });

  it("returns the extracted fields on success", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(parseResumeFromStorage).mockResolvedValue({ name: "Jane" });

    const result = await parseUploadedResume("resumes/1-a.pdf");

    expect(result).toEqual({ success: true, data: { name: "Jane" } });
  });
});
