import { afterEach, describe, expect, it, vi } from "vitest";

import { getObjectBytes } from "@/server/integrations/supabase-storage";
import { parseResumeFromStorage, reviewResumeFromStorage } from "@/server/integrations/resume-parser";

const generateContent = vi.fn();

vi.mock("@/server/integrations/supabase-storage", () => ({
  getObjectBytes: vi.fn(),
}));
vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(function GoogleGenAI() {
    return { models: { generateContent } };
  }),
}));

const PDF_BYTES = new TextEncoder().encode("%PDF-1.4 fake");

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("parseResumeFromStorage", () => {
  it("returns null when GEMINI_API_KEY is unset", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const result = await parseResumeFromStorage("resumes/1-a.pdf");

    expect(result).toBeNull();
    expect(getObjectBytes).not.toHaveBeenCalled();
  });

  it("returns null when the object doesn't exist in storage", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue(null);

    const result = await parseResumeFromStorage("resumes/1-a.pdf");

    expect(result).toBeNull();
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns null for a non-PDF object (DOCX auto-fill unsupported)", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({
      bytes: PDF_BYTES,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const result = await parseResumeFromStorage("resumes/1-a.docx");

    expect(result).toBeNull();
    expect(generateContent).not.toHaveBeenCalled();
  });

  it("returns sanitized fields on a successful parse, dropping invalid enum guesses", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/pdf" });
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        name: " Jane Candidate ",
        email: "jane@example.com",
        currentRole: "Engineer",
        linkedIn: "not-a-url",
        targetIndustry: "Not A Real Industry",
        securityClearance: "NV1",
      }),
    });

    const result = await parseResumeFromStorage("resumes/1-a.pdf");

    expect(result).toEqual({
      name: "Jane Candidate",
      email: "jane@example.com",
      currentRole: "Engineer",
      securityClearance: "NV1",
    });
  });

  it("returns null when the model returns no text", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/pdf" });
    generateContent.mockResolvedValue({ text: undefined });

    const result = await parseResumeFromStorage("resumes/1-a.pdf");

    expect(result).toBeNull();
  });

  it("returns null when the Gemini call throws", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/pdf" });
    generateContent.mockRejectedValue(new Error("network error"));

    const result = await parseResumeFromStorage("resumes/1-a.pdf");

    expect(result).toBeNull();
  });
});

describe("reviewResumeFromStorage", () => {
  const context = { targetIndustry: "ICT", currentRole: "Engineer" };

  it("returns a config error when GEMINI_API_KEY is unset", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const result = await reviewResumeFromStorage("resumes/1-a.pdf", context);

    expect(result).toEqual({ success: false, error: "AI review is not configured." });
    expect(getObjectBytes).not.toHaveBeenCalled();
  });

  it("returns an error for a non-PDF resume", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/msword" });

    const result = await reviewResumeFromStorage("resumes/1-a.docx", context);

    expect(result).toEqual({
      success: false,
      error: "AI review is only available for PDF resumes.",
    });
  });

  it("returns a sanitized review on success", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/pdf" });
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: " Strong ICT background. ",
        strengths: ["5 years experience", 42],
        concerns: [],
        suggestedInterviewQuestions: ["Tell me about your last role."],
      }),
    });

    const result = await reviewResumeFromStorage("resumes/1-a.pdf", context);

    expect(result).toEqual({
      success: true,
      review: {
        summary: "Strong ICT background.",
        strengths: ["5 years experience"],
        concerns: [],
        suggestedInterviewQuestions: ["Tell me about your last role."],
      },
    });
  });

  it("returns an error when the response is missing a usable summary", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/pdf" });
    generateContent.mockResolvedValue({ text: JSON.stringify({ summary: "   " }) });

    const result = await reviewResumeFromStorage("resumes/1-a.pdf", context);

    expect(result).toEqual({
      success: false,
      error: "The assistant's response was malformed.",
    });
  });

  it("returns a friendly error when the Gemini call throws", async () => {
    vi.stubEnv("GEMINI_API_KEY", "key");
    vi.mocked(getObjectBytes).mockResolvedValue({ bytes: PDF_BYTES, contentType: "application/pdf" });
    generateContent.mockRejectedValue(new Error("network error"));

    const result = await reviewResumeFromStorage("resumes/1-a.pdf", context);

    expect(result).toEqual({
      success: false,
      error: "The AI review is temporarily unavailable. Please try again.",
    });
  });
});
