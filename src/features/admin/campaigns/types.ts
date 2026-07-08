import type { campaignAudienceValues } from "@/server/db/schema";

export type CampaignAudience = (typeof campaignAudienceValues)[number];

export type CampaignRecipient = {
  email: string;
  name?: string | null;
  company?: string | null;
};

export type AudienceCounts = Record<CampaignAudience, number>;

export type SubmitCampaignState =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
  | null;
