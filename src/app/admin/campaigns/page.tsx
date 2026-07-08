import type { Metadata } from "next";

import { getAudienceCounts, listCampaigns } from "@/features/admin/campaigns/queries";
import { CampaignComposer } from "@/features/admin/campaigns/components/CampaignComposer";
import { CampaignHistory } from "@/features/admin/campaigns/components/CampaignHistory";

export const metadata: Metadata = {
  title: "Admin — Email Campaigns",
};

export default async function AdminCampaignsPage() {
  const [audienceCounts, campaigns] = await Promise.all([getAudienceCounts(), listCampaigns()]);

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="text-xl font-semibold">New campaign</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a personalised email to candidates and clients. Unsubscribed addresses are
          excluded automatically.
        </p>
        <div className="mt-4">
          <CampaignComposer audienceCounts={audienceCounts} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Sent campaigns ({campaigns.length})</h2>
        <div className="mt-4">
          <CampaignHistory campaigns={campaigns} />
        </div>
      </section>
    </div>
  );
}
