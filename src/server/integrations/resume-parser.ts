import { GoogleGenAI } from "@google/genai";

import { getObjectBytes } from "@/server/integrations/supabase-storage";
import { JOB_INDUSTRIES } from "@/lib/job-constants";
import { securityClearanceValues } from "@/server/db/schema";

// Fields we attempt to pull out of a resume to pre-fill the CV form. All
// optional — anything not confidently found is simply omitted.
export type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  currentRole?: string;
  linkedIn?: string;
  targetIndustry?: string;
  securityClearance?: string;
};

const MODEL = "gemini-2.5-flash";

// Both parseResumeFromStorage and reviewResumeFromStorage need the same
// fetch-and-validate step (PDF only — Gemini reads PDF bytes natively, no
// text extraction library needed). DOCX callers get null/an error and fall
// back to their own non-AI path.
async function fetchResumePdfBase64(key: string): Promise<string | null> {
  const obj = await getObjectBytes(key);
  if (!obj) return null;

  const isPdf =
    key.toLowerCase().endsWith(".pdf") || obj.contentType === "application/pdf";
  if (!isPdf) return null;

  return Buffer.from(obj.bytes).toString("base64");
}

// Auto-fill supports PDF only. DOCX uploads simply skip auto-fill (the user
// fills the form manually), which is a graceful, non-blocking fallback.
export async function parseResumeFromStorage(key: string): Promise<ParsedResume | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const base64 = await fetchResumePdfBase64(key);
  if (!base64) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are extracting contact details from a candidate's resume to pre-fill a job application form. Return ONLY a JSON object with these optional keys: name, email, phone, currentRole, linkedIn, targetIndustry, securityClearance.

Rules:
- Omit any key you cannot confidently determine (do not guess).
- "currentRole" is their most recent job title.
- "linkedIn" must be a full URL if present.
- "targetIndustry" MUST be exactly one of: ${JOB_INDUSTRIES.join(", ")} — pick the closest match, or omit if unclear.
- "securityClearance" MUST be exactly one of: ${securityClearanceValues.join(", ")} — use "None" or omit if not mentioned.`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "application/pdf", data: base64 } },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const text = res.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as ParsedResume;
    return sanitize(parsed);
  } catch (error) {
    console.error("parseResumeFromStorage failed", error);
    return null;
  }
}

// Only let through values that match the form's allowed options, so a bad
// model guess can't set an invalid industry/clearance on the form.
function sanitize(parsed: ParsedResume): ParsedResume {
  const clean: ParsedResume = {};
  if (typeof parsed.name === "string") clean.name = parsed.name.trim();
  if (typeof parsed.email === "string") clean.email = parsed.email.trim();
  if (typeof parsed.phone === "string") clean.phone = parsed.phone.trim();
  if (typeof parsed.currentRole === "string") clean.currentRole = parsed.currentRole.trim();
  if (typeof parsed.linkedIn === "string" && /^https?:\/\//i.test(parsed.linkedIn.trim())) {
    clean.linkedIn = parsed.linkedIn.trim();
  }
  if (
    typeof parsed.targetIndustry === "string" &&
    (JOB_INDUSTRIES as readonly string[]).includes(parsed.targetIndustry)
  ) {
    clean.targetIndustry = parsed.targetIndustry;
  }
  if (
    typeof parsed.securityClearance === "string" &&
    (securityClearanceValues as readonly string[]).includes(parsed.securityClearance)
  ) {
    clean.securityClearance = parsed.securityClearance;
  }
  return clean;
}

export type ResumeReview = {
  summary: string;
  strengths: string[];
  concerns: string[];
  suggestedInterviewQuestions: string[];
};

type ReviewResult =
  | { success: true; review: ResumeReview }
  | { success: false; error: string };

// Admin-facing recruiter review of a candidate's resume — distinct from
// parseResumeFromStorage (which extracts form fields at submission time).
// Same fetch-and-read-PDF approach, different prompt/output shape.
export async function reviewResumeFromStorage(
  key: string,
  context: { targetIndustry: string; currentRole: string }
): Promise<ReviewResult> {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "AI review is not configured." };
  }

  const base64 = await fetchResumePdfBase64(key);
  if (!base64) {
    return { success: false, error: "AI review is only available for PDF resumes." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are a recruiter reviewing a candidate's resume for an internal applicant tracking system. The candidate applied targeting the "${context.targetIndustry}" industry, stating their current role as "${context.currentRole}". Return ONLY a JSON object with these keys:
- "summary": a 2-3 sentence plain-language overview of the candidate's background.
- "strengths": an array of short bullet strings (their strongest relevant points for this target industry/role).
- "concerns": an array of short bullet strings (gaps, inconsistencies, or things a recruiter should probe — an empty array if none stand out).
- "suggestedInterviewQuestions": an array of 2-4 short interview questions tailored to this candidate.

Be concise and factual — base everything only on what's in the resume, don't invent experience.`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "application/pdf", data: base64 } },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const text = res.text;
    if (!text) return { success: false, error: "The assistant returned no review." };

    const parsed = JSON.parse(text) as Partial<ResumeReview>;
    const review = sanitizeReview(parsed);
    if (!review) return { success: false, error: "The assistant's response was malformed." };

    return { success: true, review };
  } catch (error) {
    console.error("reviewResumeFromStorage failed", error);
    return { success: false, error: "The AI review is temporarily unavailable. Please try again." };
  }
}

function sanitizeReview(parsed: Partial<ResumeReview>): ResumeReview | null {
  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) return null;

  const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : [];

  return {
    summary: parsed.summary.trim(),
    strengths: toStringArray(parsed.strengths),
    concerns: toStringArray(parsed.concerns),
    suggestedInterviewQuestions: toStringArray(parsed.suggestedInterviewQuestions),
  };
}
