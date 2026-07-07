import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { applicationStatusValues } from "@/server/db/schema";

type ApplicationStatus = (typeof applicationStatusValues)[number];

type Application = {
  id: string;
  jobSlug: string | null;
  jobTitle: string | null;
  status: ApplicationStatus;
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  interviewing: "Interviewing",
  offered: "Offered",
  rejected: "Not successful",
  withdrawn: "Withdrawn",
};

const STATUS_VARIANT: Record<ApplicationStatus, "secondary" | "default" | "destructive" | "outline"> = {
  submitted: "secondary",
  under_review: "secondary",
  interviewing: "default",
  offered: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

export function ApplicationStatusList({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="font-medium">No applications yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Applications you submit through Illora will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            {application.jobSlug ? (
              <Link href={`/jobs/${application.jobSlug}`} className="font-semibold hover:text-primary">
                {application.jobTitle ?? "General CV submission"}
              </Link>
            ) : (
              <span className="font-semibold">{application.jobTitle ?? "General CV submission"}</span>
            )}
            <Badge variant={STATUS_VARIANT[application.status]}>
              {STATUS_LABEL[application.status]}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
