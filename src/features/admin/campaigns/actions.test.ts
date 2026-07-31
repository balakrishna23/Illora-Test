import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  confirmCampaignUnsubscribe,
  submitCampaign,
} from "@/features/admin/campaigns/actions";
import { requireAdmin } from "@/server/auth/session";
import { sendCampaignEmails } from "@/server/integrations/resend";
import { getObjectBytes } from "@/server/integrations/r2";
import { checkRateLimit } from "@/server/lib/rate-limit-guard";
import { createUnsubscribeToken } from "@/server/lib/unsubscribe-token";
import {
  completeCampaignRecord,
  createCampaignRecord,
  getCampaignRecipients,
  getCampaignSignature,
  suppressEmail,
} from "@/features/admin/campaigns/queries";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// Mirrors Next's real redirect(), which throws to abort the action.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/server/auth/session", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/server/integrations/resend", () => ({ sendCampaignEmails: vi.fn() }));
vi.mock("@/server/integrations/r2", () => ({
  createPresignedUploadUrl: vi.fn(),
  getObjectBytes: vi.fn(),
}));
vi.mock("@/server/lib/rate-limit-guard", () => ({
  checkRateLimit: vi.fn(),
  retryAfterMessage: vi.fn(),
}));
vi.mock("@/features/admin/campaigns/queries", () => ({
  completeCampaignRecord: vi.fn(),
  createCampaignRecord: vi.fn(),
  getCampaignRecipients: vi.fn(),
  getCampaignSignature: vi.fn(),
  setCampaignSignature: vi.fn(),
  suppressEmail: vi.fn(),
}));

const ADMIN = { success: true, userId: "u1", email: "admin@illora.com.au" } as const;

function campaignFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const fields: Record<string, string> = {
    subject: "New roles for {{name}}",
    body: "Hi {{name}},\n\nWe have new opportunities.",
    audience: "candidates",
    intent: "send",
    confirm: "on",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== "") formData.set(key, value);
  }
  return formData;
}

describe("submitCampaign", () => {
  beforeEach(() => {
    vi.stubEnv("CAMPAIGN_UNSUBSCRIBE_SECRET", "test-secret");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://illora.test");
    vi.mocked(requireAdmin).mockResolvedValue({ ...ADMIN });
    vi.mocked(sendCampaignEmails).mockResolvedValue({ sentCount: 1, failedCount: 0 });
    vi.mocked(createCampaignRecord).mockResolvedValue("campaign-1");
    vi.mocked(getCampaignRecipients).mockResolvedValue([
      { email: "sam@example.com", name: "Sam" },
      { email: "lee@example.com" },
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("rejects non-admins without sending", async () => {
    vi.mocked(requireAdmin).mockResolvedValue({ success: false, error: "No access." });

    const result = await submitCampaign(null, campaignFormData());

    expect(result).toEqual({ success: false, error: "No access." });
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });

  it("returns a typed error when unsubscribe config is missing", async () => {
    vi.stubEnv("CAMPAIGN_UNSUBSCRIBE_SECRET", "");

    const result = await submitCampaign(null, campaignFormData());

    expect(result?.success).toBe(false);
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });

  it("returns field errors for an empty subject", async () => {
    const result = await submitCampaign(null, campaignFormData({ subject: "" }));

    expect(result?.success).toBe(false);
    if (result?.success === false) {
      expect(result.fieldErrors?.subject).toBeTruthy();
    }
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });

  it("sends a test email only to the signed-in admin", async () => {
    const result = await submitCampaign(null, campaignFormData({ intent: "test" }));

    expect(result).toEqual({
      success: true,
      message: `Test email sent to ${ADMIN.email}.`,
    });
    expect(getCampaignRecipients).not.toHaveBeenCalled();
    expect(createCampaignRecord).not.toHaveBeenCalled();

    const emails = vi.mocked(sendCampaignEmails).mock.calls[0][0];
    expect(emails).toHaveLength(1);
    expect(emails[0].to).toBe(ADMIN.email);
    expect(emails[0].subject).toBe("[Test] New roles for Test Recipient");
  });

  it("refuses a full send without the confirmation checkbox", async () => {
    const formData = campaignFormData();
    formData.delete("confirm");

    const result = await submitCampaign(null, formData);

    expect(result?.success).toBe(false);
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });

  it("sends to every recipient with personalised, tokenised emails and records the campaign", async () => {
    vi.mocked(sendCampaignEmails).mockResolvedValue({ sentCount: 2, failedCount: 0 });

    const result = await submitCampaign(null, campaignFormData());

    expect(result).toEqual({ success: true, message: "Campaign sent to 2 recipients." });
    expect(createCampaignRecord).toHaveBeenCalledWith({
      subject: "New roles for {{name}}",
      body: "Hi {{name}},\n\nWe have new opportunities.",
      audience: "candidates",
      recipientCount: 2,
      createdBy: ADMIN.email,
      replyTo: null,
      attachmentR2Key: null,
      attachmentFilename: null,
    });
    expect(completeCampaignRecord).toHaveBeenCalledWith("campaign-1", {
      sentCount: 2,
      failedCount: 0,
      status: "sent",
    });

    const emails = vi.mocked(sendCampaignEmails).mock.calls[0][0];
    expect(emails.map((e) => e.to)).toEqual(["sam@example.com", "lee@example.com"]);
    expect(emails[0].subject).toBe("New roles for Sam");
    expect(emails[1].subject).toBe("New roles for there");
    expect(emails[0].unsubscribeUrl).toBe(
      `https://illora.test/email-preferences/unsubscribe?email=sam%40example.com&token=${createUnsubscribeToken("sam@example.com")}`
    );
    expect(emails[0].html).toContain(emails[0].unsubscribeUrl);
    expect(emails[0].text).toContain(emails[0].unsubscribeUrl);
  });

  it("marks the campaign failed when nothing sends", async () => {
    vi.mocked(sendCampaignEmails).mockResolvedValue({ sentCount: 0, failedCount: 2 });

    const result = await submitCampaign(null, campaignFormData());

    expect(result?.success).toBe(false);
    expect(completeCampaignRecord).toHaveBeenCalledWith("campaign-1", {
      sentCount: 0,
      failedCount: 2,
      status: "failed",
    });
  });

  it("errors when the audience is empty", async () => {
    vi.mocked(getCampaignRecipients).mockResolvedValue([]);

    const result = await submitCampaign(null, campaignFormData());

    expect(result?.success).toBe(false);
    expect(createCampaignRecord).not.toHaveBeenCalled();
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });

  it("appends the shared signature only when includeSignature is checked", async () => {
    vi.mocked(getCampaignSignature).mockResolvedValue("— The Illoura team");

    await submitCampaign(null, campaignFormData({ includeSignature: "on" }));

    expect(getCampaignSignature).toHaveBeenCalled();
    const emails = vi.mocked(sendCampaignEmails).mock.calls[0][0];
    expect(emails[0].text).toContain("— The Illoura team");
  });

  it("does not fetch or append a signature when unchecked", async () => {
    await submitCampaign(null, campaignFormData());

    expect(getCampaignSignature).not.toHaveBeenCalled();
  });

  it("passes reply-to through to sendCampaignEmails", async () => {
    await submitCampaign(null, campaignFormData({ replyTo: "consultant@illouraservices.com" }));

    const options = vi.mocked(sendCampaignEmails).mock.calls[0][1];
    expect(options).toMatchObject({ replyTo: "consultant@illouraservices.com" });
  });

  it("attaches the uploaded file when an attachment key is present", async () => {
    vi.mocked(getObjectBytes).mockResolvedValue({
      bytes: new Uint8Array([1, 2, 3]),
      contentType: "application/pdf",
    });

    await submitCampaign(
      null,
      campaignFormData({
        attachmentR2Key: "campaign-attachments/123-brochure.pdf",
        attachmentFilename: "brochure.pdf",
      })
    );

    expect(getObjectBytes).toHaveBeenCalledWith("campaign-attachments/123-brochure.pdf");
    const options = vi.mocked(sendCampaignEmails).mock.calls[0][1];
    expect(options?.attachment).toMatchObject({ filename: "brochure.pdf" });
    expect(createCampaignRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        attachmentR2Key: "campaign-attachments/123-brochure.pdf",
        attachmentFilename: "brochure.pdf",
      })
    );
  });

  it("rejects the send when the attachment upload never completed", async () => {
    vi.mocked(getObjectBytes).mockResolvedValue(null);

    const result = await submitCampaign(
      null,
      campaignFormData({
        attachmentR2Key: "campaign-attachments/123-brochure.pdf",
        attachmentFilename: "brochure.pdf",
      })
    );

    expect(result?.success).toBe(false);
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });

  it("rejects an oversized attachment", async () => {
    vi.mocked(getObjectBytes).mockResolvedValue({
      bytes: new Uint8Array(11 * 1024 * 1024),
      contentType: "application/pdf",
    });

    const result = await submitCampaign(
      null,
      campaignFormData({
        attachmentR2Key: "campaign-attachments/123-huge.pdf",
        attachmentFilename: "huge.pdf",
      })
    );

    expect(result?.success).toBe(false);
    expect(sendCampaignEmails).not.toHaveBeenCalled();
  });
});

describe("confirmCampaignUnsubscribe", () => {
  beforeEach(() => {
    vi.stubEnv("CAMPAIGN_UNSUBSCRIBE_SECRET", "test-secret");
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  function unsubscribeFormData(email: string, token: string): FormData {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("token", token);
    return formData;
  }

  it("suppresses the email for a valid token, then redirects to the done state", async () => {
    const token = createUnsubscribeToken("sam@example.com");

    await expect(
      confirmCampaignUnsubscribe(unsubscribeFormData("sam@example.com", token))
    ).rejects.toThrow("REDIRECT:/email-preferences/unsubscribe?done=1");

    expect(suppressEmail).toHaveBeenCalledWith("sam@example.com");
  });

  it("rejects a forged token without touching the database", async () => {
    await expect(
      confirmCampaignUnsubscribe(unsubscribeFormData("sam@example.com", "deadbeef"))
    ).rejects.toThrow("REDIRECT:/email-preferences/unsubscribe");

    expect(suppressEmail).not.toHaveBeenCalled();
  });

  it("rejects missing fields without touching the database", async () => {
    await expect(confirmCampaignUnsubscribe(new FormData())).rejects.toThrow(
      "REDIRECT:/email-preferences/unsubscribe"
    );

    expect(suppressEmail).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfterSeconds: 60 });
    const token = createUnsubscribeToken("sam@example.com");

    await expect(
      confirmCampaignUnsubscribe(unsubscribeFormData("sam@example.com", token))
    ).rejects.toThrow("REDIRECT:/email-preferences/unsubscribe");

    expect(suppressEmail).not.toHaveBeenCalled();
  });
});
