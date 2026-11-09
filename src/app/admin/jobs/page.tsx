import type { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllJobsAdmin } from "@/features/admin/jobs/queries";
import { JobRowActions } from "@/features/admin/jobs/components/JobRowActions";
import type { AdminJob } from "@/features/admin/jobs/queries";

export const metadata: Metadata = {
  title: "Admin — Jobs",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ status?: string }> };

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending review" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "rejected", label: "Rejected" },
] as const;

function statusBadgeVariant(status: AdminJob["status"]) {
  if (status === "active") return "default" as const;
  if (status === "pending") return "secondary" as const;
  if (status === "rejected") return "destructive" as const;
  return "outline" as const;
}

export default async function AdminJobsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const activeTab = STATUS_TABS.some((t) => t.value === status) ? status! : "all";

  const allJobs = await getAllJobsAdmin();
  const jobs = activeTab === "all" ? allJobs : allJobs.filter((j) => j.status === activeTab);
  const pendingCount = allJobs.filter((j) => j.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Jobs ({jobs.length})</h2>
        <Link href="/admin/jobs/new" className={buttonVariants({ variant: "accent", size: "sm" })}>
          New job
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/jobs" : `/admin/jobs?status=${tab.value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeTab === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Source</th>
              <th className="px-4 py-2.5">Location</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/admin/jobs/${job.id}`} className="font-medium hover:text-primary">
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {job.source === "illoura" ? "Illoura" : job.sourceLabel ?? job.source}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {job.location}, {job.state}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <JobRowActions id={job.id} status={job.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
