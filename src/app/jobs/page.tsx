import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { JobsClient } from "@/features/jobs/components/JobsClient";
import { getAllJobs } from "@/server/integrations/jobadder";
import { getSessionUser } from "@/server/auth/session";
import { getCandidateByAuthUserId, getSavedJobs } from "@/features/portal/queries";

export const metadata: Metadata = {
  title: "Jobs",
  description:
    "Search live AI Engineering, Cyber Security, and Data Analytics jobs. Filter by location, type, and specialism.",
  alternates: { canonical: "/jobs" },
};

type SearchParams = Promise<{ q?: string; industry?: string; state?: string }>;

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const [jobs, params, sessionUser] = await Promise.all([getAllJobs(), searchParams, getSessionUser()]);

  const candidate = sessionUser ? await getCandidateByAuthUserId(sessionUser.userId) : null;
  const savedJobIds = candidate ? (await getSavedJobs(candidate.id)).map((j) => j.jobId) : [];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Illoura Live Job Listings",
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/jobs/${job.slug}`,
      name: job.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Jobs", href: "/jobs" },
          ]}
        />
        <div className="mt-8">
          <h1 className="text-3xl font-semibold tracking-tight">Find Your Next Role</h1>
          <p className="mt-2 text-muted-foreground">
            {jobs.length} live roles in AI Engineering, Cyber Security, and Data Analytics, Australia-wide.
          </p>
        </div>
        <JobsClient
          jobs={jobs}
          initialQuery={params.q ?? ""}
          initialIndustry={params.industry ?? ""}
          initialState={params.state ?? ""}
          savedJobIds={savedJobIds}
          isSignedIn={Boolean(sessionUser)}
        />
      </div>
    </>
  );
}
