import { Badge } from "@/components/ui/badge";
import type { emailCampaigns } from "@/server/db/schema";

type Campaign = typeof emailCampaigns.$inferSelect;

const AUDIENCE_LABELS: Record<Campaign["audience"], string> = {
  candidates: "Candidates",
  clients: "Clients",
  all: "All contacts",
};

export function CampaignHistory({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return <p className="text-sm text-muted-foreground">No campaigns sent yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{campaign.subject}</p>
              <p className="text-xs text-muted-foreground">
                {AUDIENCE_LABELS[campaign.audience]} · sent {campaign.sentCount}/
                {campaign.recipientCount}
                {campaign.failedCount > 0 && ` (${campaign.failedCount} failed)`} ·{" "}
                {campaign.createdAt.toLocaleDateString("en-AU")} by {campaign.createdBy}
              </p>
            </div>
            <Badge variant={campaign.status === "failed" ? "destructive" : "secondary"}>
              {campaign.status}
            </Badge>
          </div>
          <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
            {campaign.body}
          </p>
        </div>
      ))}
    </div>
  );
}
