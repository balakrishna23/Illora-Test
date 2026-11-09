import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getResumeDownloadUrl, reviewResumeWithAi } from "@/features/admin/applications/actions";
import { requireAdmin } from "@/server/auth/session";
import { createPresignedDownloadUrl } from "@/server/integrations/supabase-storage";
import { reviewResumeFromStorage } from "@/server/integrations/resume-parser";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { getApplicationForFileAccess } from "@/features/admin/applications/queries";

// updateApplicationStatus (untested here) touches db directly; stub it so
// importing the real actions.ts module doesn't require a live DATABASE_URL.
vi.mock("@/server/db/client", () => ({ db: {} }));
vi.mock("@/server/auth/session", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/server/integrations/supabase-storage", () => ({
  createPresignedDownloadUrl: vi.fn(),
}));
vi.mock("@/server/integrations/resume-parser", () => ({
  reviewResumeFromStorage: vi.fn(),
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({ checkRateLimit: vi.fn() }));
vi.mock("@/features/admin/applications/queries", () => ({
  getApplicationForFileAccess: vi.fn(),
}));

const ADMIN = { success: true, userId: "u1", email: "admin@illora.com.au" } as const;
const APPLICATION_ID = "11111111-1111-4111-8111-111111111111";

const APPLICATION = {
  name: "Jane Candidate",
  targetIndustry: "AI Engineering",
  currentRole: "Engineer",
  resumeStorageKey: "resumes/123-jane.pdf",
  coverLetterStorageKey: null as string | null,
};

describe("getResumeDownloadUrl", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockResolvedValue({ ...ADMIN });
    vi.mocked(getApplicationForFileAccess).mockResolvedValue({ ...APPLICATION });
    vi.mocked(createPresignedDownloadUrl).mockResolvedValue({
      downloadUrl: "https://storage.example/signed",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admins", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ success: false, error: "No access." });

    const result = await getResumeDownloadUrl("resume", APPLICATION_ID);

    expect(result).toEqual({ success: false, error: "No access." });
    expect(createPresignedDownloadUrl).not.toHaveBeenCalled();
  });

  it("rejects an invalid application id", async () => {
    const result = await getResumeDownloadUrl("resume", "not-a-uuid");

    expect(result).toEqual({ success: false, error: "Invalid application." });
    expect(getApplicationForFileAccess).not.toHaveBeenCalled();
  });

  it("errors when the application doesn't exist", async () => {
    vi.mocked(getApplicationForFileAccess).mockResolvedValue(null);

    const result = await getResumeDownloadUrl("resume", APPLICATION_ID);

    expect(result).toEqual({ success: false, error: "Application not found." });
  });

  it("errors when the requested file kind has no key on file", async () => {
    const result = await getResumeDownloadUrl("coverLetter", APPLICATION_ID);

    expect(result).toEqual({ success: false, error: "No file on file for this candidate." });
    expect(createPresignedDownloadUrl).not.toHaveBeenCalled();
  });

  it("signs a download URL for the resume", async () => {
    const result = await getResumeDownloadUrl("resume", APPLICATION_ID);

    expect(result).toEqual({ success: true, downloadUrl: "https://storage.example/signed" });
    expect(createPresignedDownloadUrl).toHaveBeenCalledWith({
      key: "resumes/123-jane.pdf",
      downloadFilename: "Jane-Candidate-resume.pdf",
    });
  });

  it("returns a typed error when signing fails", async () => {
    vi.mocked(createPresignedDownloadUrl).mockRejectedValue(new Error("boom"));

    const result = await getResumeDownloadUrl("resume", APPLICATION_ID);

    expect(result?.success).toBe(false);
  });
});

describe("reviewResumeWithAi", () => {
  beforeEach(() => {
    vi.mocked(requireAdmin).mockResolvedValue({ ...ADMIN });
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(getApplicationForFileAccess).mockResolvedValue({ ...APPLICATION });
    vi.mocked(reviewResumeFromStorage).mockResolvedValue({
      success: true,
      review: {
        summary: "Strong ICT background.",
        strengths: ["5 years experience"],
        concerns: [],
        suggestedInterviewQuestions: ["Tell me about your last role."],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admins", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ success: false, error: "No access." });

    const result = await reviewResumeWithAi(APPLICATION_ID);

    expect(result).toEqual({ success: false, error: "No access." });
    expect(reviewResumeFromStorage).not.toHaveBeenCalled();
  });

  it("rejects an invalid application id", async () => {
    const result = await reviewResumeWithAi("not-a-uuid");

    expect(result).toEqual({ success: false, error: "Invalid application." });
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("refuses when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 30 });

    const result = await reviewResumeWithAi(APPLICATION_ID);

    expect(result?.success).toBe(false);
    expect(reviewResumeFromStorage).not.toHaveBeenCalled();
  });

  it("errors when the application doesn't exist", async () => {
    vi.mocked(getApplicationForFileAccess).mockResolvedValue(null);

    const result = await reviewResumeWithAi(APPLICATION_ID);

    expect(result).toEqual({ success: false, error: "Application not found." });
  });

  it("errors when there's no resume on file", async () => {
    vi.mocked(getApplicationForFileAccess).mockResolvedValue({
      ...APPLICATION,
      resumeStorageKey: null,
    });

    const result = await reviewResumeWithAi(APPLICATION_ID);

    expect(result).toEqual({ success: false, error: "No resume on file for this candidate." });
    expect(reviewResumeFromStorage).not.toHaveBeenCalled();
  });

  it("calls the Gemini review with the resume key and candidate context, returning its result", async () => {
    const result = await reviewResumeWithAi(APPLICATION_ID);

    expect(reviewResumeFromStorage).toHaveBeenCalledWith("resumes/123-jane.pdf", {
      targetIndustry: "AI Engineering",
      currentRole: "Engineer",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.review.summary).toBe("Strong ICT background.");
    }
  });

  it("propagates a failure result from the AI review unchanged (e.g. non-PDF resume)", async () => {
    vi.mocked(reviewResumeFromStorage).mockResolvedValue({
      success: false,
      error: "AI review is only available for PDF resumes.",
    });

    const result = await reviewResumeWithAi(APPLICATION_ID);

    expect(result).toEqual({
      success: false,
      error: "AI review is only available for PDF resumes.",
    });
  });
});
