import { db } from "@/server/db/client";
import { siteSettings } from "@/server/db/schema";

export type SiteStats = {
  yearsOperating: number;
  candidatesPlaced: number;
  clientRetentionPct: number;
  activeEmployers: number;
};

// Shown only until an admin saves real values via /admin/settings — keeps the
// homepage from displaying zeros before the singleton row is first created.
const FALLBACK_STATS: SiteStats = {
  yearsOperating: 0,
  candidatesPlaced: 0,
  clientRetentionPct: 0,
  activeEmployers: 0,
};

export async function getSiteStats(): Promise<SiteStats> {
  const [row] = await db
    .select({
      yearsOperating: siteSettings.yearsOperating,
      candidatesPlaced: siteSettings.candidatesPlaced,
      clientRetentionPct: siteSettings.clientRetentionPct,
      activeEmployers: siteSettings.activeEmployers,
    })
    .from(siteSettings)
    .limit(1);

  return row ?? FALLBACK_STATS;
}
