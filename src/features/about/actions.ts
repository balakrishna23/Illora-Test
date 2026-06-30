"use server";

import { z } from "zod";

const capabilitySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
});

export async function requestCapabilityStatement(
  _prev: unknown,
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = capabilitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please provide a valid name and email." };

  // Stub: send Resend email with PDF link
  // await resend.emails.send({ to: parsed.data.email, subject: "Illora Capability Statement", ... });

  return { success: true };
}
