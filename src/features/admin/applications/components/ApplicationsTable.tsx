"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { DownloadIcon, SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApplicationStatusSelect } from "@/features/admin/applications/components/ApplicationStatusSelect";
import { getResumeDownloadUrl } from "@/features/admin/applications/actions";
import type { applicationStatusValues } from "@/server/db/schema";

export type AdminApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetIndustry: string;
  securityClearance: string;
  status: (typeof applicationStatusValues)[number];
  submittedAt: string;
  jobSlug: string | null;
  jobTitle: string | null;
  hasResume: boolean;
  hasCoverLetter: boolean;
};

function FileButton({
  kind,
  applicationId,
  label,
}: {
  kind: "resume" | "coverLetter";
  applicationId: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    startTransition(async () => {
      const result = await getResumeDownloadUrl(kind, applicationId);
      if (result.success) {
        // Short-lived signed URL — open in a new tab to view/download.
        window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={open}
        disabled={isPending}
      >
        <DownloadIcon aria-hidden="true" />
        {isPending ? "Preparing…" : label}
      </Button>
      {error && <span className="mt-1 text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function ApplicationsTable({ applications }: { applications: AdminApplicationRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.jobTitle?.toLowerCase().includes(q) ?? false) ||
        a.targetIndustry.toLowerCase().includes(q)
    );
  }, [applications, query]);

  return (
    <div>
      <div className="mt-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, job, or industry…"
            className="pl-8"
            aria-label="Search applications"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {applications.length}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Candidate</th>
              <th className="px-4 py-2.5">Job</th>
              <th className="px-4 py-2.5">Files</th>
              <th className="px-4 py-2.5">Submitted</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No applications match “{query}”.
                </td>
              </tr>
            ) : (
              filtered.map((application) => (
                <tr key={application.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{application.name}</p>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                    <p className="text-xs text-muted-foreground">{application.phone}</p>
                    <p className="text-xs text-muted-foreground">{application.targetIndustry}</p>
                    {application.securityClearance && application.securityClearance !== "None" && (
                      <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        Clearance: {application.securityClearance}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {application.jobSlug && application.jobTitle ? (
                      <Link href={`/jobs/${application.jobSlug}`} className="hover:text-primary">
                        {application.jobTitle}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">General submission</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {application.hasResume ? (
                        <FileButton kind="resume" applicationId={application.id} label="Resume" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No resume</span>
                      )}
                      {application.hasCoverLetter && (
                        <FileButton
                          kind="coverLetter"
                          applicationId={application.id}
                          label="Cover letter"
                        />
                      )}
                    </div>
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
