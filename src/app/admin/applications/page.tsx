import type { Metadata } from "next";
import Link from "next/link";

import { getAllApplications } from "@/features/admin/applications/queries";
import { ApplicationStatusSelect } from "@/features/admin/applications/components/ApplicationStatusSelect";

export const metadata: Metadata = {
  title: "Admin — Applications",
};

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();

  return (
    <div>
      <h2 className="text-xl font-semibold">Applications ({applications.length})</h2>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Candidate</th>
              <th className="px-4 py-2.5">Job</th>
              <th className="px-4 py-2.5">Industry</th>
              <th className="px-4 py-2.5">Submitted</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => {
              const jobSlug = application.liveJobSlug ?? application.jobSlug;
              const jobTitle = application.liveJobTitle ?? application.jobTitle;
              return (
                <tr key={application.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{application.name}</p>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                    <p className="text-xs text-muted-foreground">{application.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {jobSlug && jobTitle ? (
                      <Link href={`/jobs/${jobSlug}`} className="hover:text-primary">
                        {jobTitle}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">General submission</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{application.targetIndustry}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(application.submittedAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <ApplicationStatusSelect id={application.id} status={application.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
