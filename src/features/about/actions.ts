"use server";

import { z } from "zod";

import { isBotSubmission } from "@/lib/honeypot";
import { checkRateLimit, retryAfterMessage } from "@/server/lib/rate-limit-guard";
import { sendCapabilityStatementEmail } from "@/server/integrations/resend";

const capabilitySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
});

export async function requestCapabilityStatement(
  _prev: unknown,
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  // Silently accept bot submissions. Guards are in place now so wiring up the
  // real email send below can't become an unthrottled spam vector.
  if (isBotSubmission(formData)) return { success: true };

  const rate = await checkRateLimit("requestCapabilityStatement");
  if (!rate.ok) {
    return { success: false, error: `Too many requests. ${retryAfterMessage(rate.retryAfterSeconds)}` };
  }

  const parsed = capabilitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please provide a valid name and email." };

  const { success } = await sendCapabilityStatementEmail({
    to: parsed.data.email,
    name: parsed.data.name,
  });
  if (!success) {
    return { success: false, error: "Could not send the email. Please try again shortly." };
  }

  return { success: true };
}
