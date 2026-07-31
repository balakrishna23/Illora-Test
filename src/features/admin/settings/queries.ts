import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";

export type AdminSiteSettings = typeof siteSettings.$inferSelect;

export async function getSiteSettingsAdmin(): Promise<AdminSiteSettings | null> {
  const [row] = await db.select().from(siteSettings).limit(1);
  return row ?? null;
}
