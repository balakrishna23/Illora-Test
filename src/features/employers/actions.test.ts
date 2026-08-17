import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerVacancy } from "@/features/employers/actions";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { sendVacancyConfirmationEmail } from "@/server/integrations/resend";

const insertValues = vi.fn();
vi.mock("@/server/db/client", () => ({
  db: { insert: vi.fn(() => ({ values: insertValues })) },
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: () => "Please try again later.",
}));
vi.mock("@/server/integrations/resend", () => ({
  sendVacancyConfirmationEmail: vi.fn(),
}));

function vacancyFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    companyName: "Acme Pty Ltd",
    contactName: "Alex Employer",
    email: "alex@acme.com",
    phone: "0400000000",
    roleTitle: "Site Supervisor",
    employmentType: "Permanent",
    location: "Sydney",
    industry: "Construction",
    urgency: "ASAP",
    message: "We need someone to start within the month.",
    marketingConsent: "on",
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    fd.set(key, value);
  }
  return fd;
}

describe("registerVacancy", () => {
  beforeEach(() => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
    vi.mocked(sendVacancyConfirmationEmail).mockResolvedValue({ success: true });
    insertValues.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("silently accepts a bot submission without touching rate limiting or the db", async () => {
    const fd = vacancyFormData({ contactFax: "http://spam.example" });

    const result = await registerVacancy(null, fd);

    expect(result).toEqual({ success: true });
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 30 });

    const result = await registerVacancy(null, vacancyFormData());

    expect(result.success).toBe(false);
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input", async () => {
    const result = await registerVacancy(null, vacancyFormData({ email: "not-an-email" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("rejects an industry outside the known taxonomy", async () => {
    const result = await registerVacancy(null, vacancyFormData({ industry: "Made Up Industry" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.industry).toBeDefined();
    }
  });

  it("saves the vacancy request and sends a confirmation email", async () => {
    const result = await registerVacancy(null, vacancyFormData());

    expect(result).toEqual({ success: true });
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ companyName: "Acme Pty Ltd", roleTitle: "Site Supervisor" })
    );
    expect(sendVacancyConfirmationEmail).toHaveBeenCalledWith({
      to: "alex@acme.com",
      contactName: "Alex Employer",
      companyName: "Acme Pty Ltd",
      roleTitle: "Site Supervisor",
    });
  });

  it("still succeeds when the confirmation email fails to send (non-fatal)", async () => {
    vi.mocked(sendVacancyConfirmationEmail).mockRejectedValue(new Error("resend down"));

    const result = await registerVacancy(null, vacancyFormData());

    expect(result).toEqual({ success: true });
  });
});
