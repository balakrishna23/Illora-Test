import { GoogleGenAI } from "@google/genai";

import { getObjectBytes } from "@/server/integrations/r2";
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

// Auto-fill supports PDF only — Gemini reads PDF bytes natively, so no text
// extraction library is needed. DOCX uploads simply skip auto-fill (the user
// fills the form manually), which is a graceful, non-blocking fallback.
export async function parseResumeFromR2(key: string): Promise<ParsedResume | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  const obj = await getObjectBytes(key);
  if (!obj) return null;

  const isPdf =
    key.toLowerCase().endsWith(".pdf") || obj.contentType === "application/pdf";
  if (!isPdf) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const base64 = Buffer.from(obj.bytes).toString("base64");

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
    console.error("parseResumeFromR2 failed", error);
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
