import { describe, expect, it } from "vitest";

import { HONEYPOT_FIELD, isBotSubmission } from "@/lib/honeypot";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.set(key, value);
  return fd;
}

describe("isBotSubmission", () => {
  it("passes a normal submission with the honeypot empty", () => {
    expect(isBotSubmission(form({ name: "Real Person", email: "a@b.com" }))).toBe(false);
  });

  it("passes when the honeypot field is absent entirely", () => {
    expect(isBotSubmission(form({ name: "Real Person" }))).toBe(false);
  });

  it("flags a submission where the honeypot is filled", () => {
    expect(isBotSubmission(form({ [HONEYPOT_FIELD]: "http://spam.example" }))).toBe(true);
  });

  it("treats a whitespace-only honeypot value as empty (not a bot)", () => {
    expect(isBotSubmission(form({ [HONEYPOT_FIELD]: "   " }))).toBe(false);
  });
});
