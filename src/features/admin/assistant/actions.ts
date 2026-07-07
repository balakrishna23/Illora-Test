"use server";

import { z } from "zod";

import { requireAdmin } from "@/server/auth/session";
import { runAdminAssistantQuery } from "@/server/integrations/gemini";

const questionSchema = z.string().min(1).max(2000);

export async function askAdminAssistant(
  question: string
): Promise<{ success: true; answer: string } | { success: false; error: string }> {
  const session = await requireAdmin();
  if (!session.success) {
    return { success: false, error: session.error };
  }

  const parsed = questionSchema.safeParse(question);
  if (!parsed.success) {
    return { success: false, error: "Please enter a question." };
  }

  return runAdminAssistantQuery(parsed.data);
}
