"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";

const settingsSchema = z.object({
  yearsOperating: z.coerce.number().int().min(0),
  candidatesPlaced: z.coerce.number().int().min(0),
  clientRetentionPct: z.coerce.number().int().min(0).max(100),
  activeEmployers: z.coerce.number().int().min(0),
});

export type SettingsFormState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateSiteSettings(
  _prev: SettingsFormState | null,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await requireAdmin();
  if (!session.success) return { success: false, error: session.error };

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const [existing] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);

  if (existing) {
    await db
      .update(siteSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values(parsed.data);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");

  return { success: true };
}
