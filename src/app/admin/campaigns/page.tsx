import type { Metadata } from "next";

import {
  getAudienceCounts,
  getCampaignSignature,
  listCampaigns,
} from "@/features/admin/campaigns/queries";
import { CampaignComposer } from "@/features/admin/campaigns/components/CampaignComposer";
import { CampaignHistory } from "@/features/admin/campaigns/components/CampaignHistory";
import { CampaignSignatureForm } from "@/features/admin/campaigns/components/CampaignSignatureForm";

export const metadata: Metadata = {
  title: "Admin — Email Campaigns",
  robots: { index: false, follow: false },
};

export default async function AdminCampaignsPage() {
  const [audienceCounts, campaigns, signature] = await Promise.all([
    getAudienceCounts(),
    listCampaigns(),
    getCampaignSignature(),
  ]);

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
        <h2 className="text-xl font-semibold">Email signature</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shared across every campaign — edit it here rather than retyping it each time.
        </p>
        <div className="mt-4">
          <CampaignSignatureForm signature={signature} />
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
