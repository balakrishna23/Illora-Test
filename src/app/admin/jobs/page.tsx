import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllJobsAdmin } from "@/features/admin/jobs/queries";
import { JobRowActions } from "@/features/admin/jobs/components/JobRowActions";

export const metadata: Metadata = {
  title: "Admin — Jobs",
};

export default async function AdminJobsPage() {
  const jobs = await getAllJobsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Jobs ({jobs.length})</h2>
        <Link href="/admin/jobs/new" className={buttonVariants({ variant: "accent", size: "sm" })}>
          New job
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Industry</th>
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
                <td className="px-4 py-3 text-muted-foreground">{job.industry}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {job.location}, {job.state}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={job.status === "active" ? "default" : "outline"}>{job.status}</Badge>
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
