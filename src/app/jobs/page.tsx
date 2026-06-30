import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { JobsClient } from "@/features/jobs/components/JobsClient";
import { getAllJobs } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Jobs",
  description:
    "Search live job listings across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. Filter by location, type, and industry.",
};

export default async function JobsPage() {
  const jobs = await getAllJobs();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Illora Live Job Listings",
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://illora.com.au/jobs/${job.slug}`,
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
          <h1 className="text-3xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-2 text-muted-foreground">
            {jobs.length} live roles across our seven specialist sectors, Australia-wide.
          </p>
        </div>
        <JobsClient jobs={jobs} />
      </div>
    </>
  );
}
