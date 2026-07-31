import { PaperclipIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { emailCampaigns } from "@/server/db/schema";

type Campaign = typeof emailCampaigns.$inferSelect;

function audienceLabel(audience: Campaign["audience"]): string {
  if (audience === "candidates") return "All candidates";
  if (audience === "clients") return "Clients";
  if (audience === "general") return "Website enquiries";
  if (audience === "all") return "All contacts";
  if (audience.startsWith("candidates:")) {
    return `Candidates — ${audience.slice("candidates:".length)}`;
  }
  return audience;
}

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
                {audienceLabel(campaign.audience)} · sent {campaign.sentCount}/
                {campaign.recipientCount}
                {campaign.failedCount > 0 && ` (${campaign.failedCount} failed)`} ·{" "}
                {campaign.createdAt.toLocaleDateString("en-AU")} by {campaign.createdBy}
                {campaign.replyTo && <> · reply-to {campaign.replyTo}</>}
              </p>
              {campaign.attachmentFilename && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <PaperclipIcon className="size-3" aria-hidden="true" />
                  {campaign.attachmentFilename}
                </p>
              )}
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
