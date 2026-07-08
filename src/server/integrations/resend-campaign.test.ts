import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendCampaignEmails, type CampaignEmail } from "@/server/integrations/resend";

const batchSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    batch = { send: batchSend };
  },
}));

function makeEmails(count: number): CampaignEmail[] {
  return Array.from({ length: count }, (_, i) => ({
    to: `user${i}@example.com`,
    subject: `Subject ${i}`,
    html: "<p>Hi</p>",
    text: "Hi",
    unsubscribeUrl: `https://illora.test/u/${i}`,
  }));
}

function okResponse(count: number, errors: { index: number; message: string }[] = []) {
  return {
    data: {
      data: Array.from({ length: count - errors.length }, (_, i) => ({ id: `id-${i}` })),
      errors,
    },
    error: null,
  };
}

describe("sendCampaignEmails", () => {
  beforeEach(() => {
    batchSend.mockReset();
  });

  it("splits recipients into chunks of 100", async () => {
    batchSend.mockImplementation(async (payload: unknown[]) => okResponse(payload.length));

    const result = await sendCampaignEmails(makeEmails(250));

    expect(batchSend).toHaveBeenCalledTimes(3);
    expect(batchSend.mock.calls.map((call) => call[0].length)).toEqual([100, 100, 50]);
    expect(result).toEqual({ sentCount: 250, failedCount: 0 });
  });

  it("passes per-email fields, unsubscribe header, and permissive validation", async () => {
    batchSend.mockImplementation(async (payload: unknown[]) => okResponse(payload.length));

    await sendCampaignEmails(makeEmails(1));

    const [payload, options] = batchSend.mock.calls[0];
    expect(payload[0]).toMatchObject({
      to: "user0@example.com",
      subject: "Subject 0",
      headers: { "List-Unsubscribe": "<https://illora.test/u/0>" },
    });
    expect(options).toEqual({ batchValidation: "permissive" });
  });

  it("counts individual permissive-validation failures without failing the chunk", async () => {
    batchSend.mockResolvedValue(okResponse(2, [{ index: 1, message: "invalid to" }]));

    const result = await sendCampaignEmails(makeEmails(2));

    expect(result).toEqual({ sentCount: 1, failedCount: 1 });
  });

  it("counts a whole chunk as failed on an API error and keeps going", async () => {
    batchSend
      .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
      .mockImplementation(async (payload: unknown[]) => okResponse(payload.length));

    const result = await sendCampaignEmails(makeEmails(150));

    expect(result).toEqual({ sentCount: 50, failedCount: 100 });
  });

  it("survives a thrown network error and continues with later chunks", async () => {
    batchSend
      .mockRejectedValueOnce(new Error("network down"))
      .mockImplementation(async (payload: unknown[]) => okResponse(payload.length));

    const result = await sendCampaignEmails(makeEmails(150));

    expect(result).toEqual({ sentCount: 50, failedCount: 100 });
  });
});
