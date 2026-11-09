import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { ORGANIZATION_JSON_LD } from "@/lib/organization-schema";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPinIcon, BriefcaseIcon, CalendarIcon, HashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { JobLocationMap } from "@/features/jobs/components/JobLocationMap";
import { SaveJobButton } from "@/features/portal/components/SaveJobButton";
import { getSessionUser } from "@/server/auth/session";
import { getCandidateByAuthUserId, isJobSaved } from "@/features/portal/queries";
import { getJobBySlug, getSimilarJobs, getAllJobs } from "@/server/integrations/jobadder";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  return {
    title: job.title,
    description: job.teaser,
    alternates: { canonical: `/jobs/${slug}` },
  };
}

export async function generateStaticParams() {
  const jobs = await getAllJobs();
  return jobs.map((j) => ({ slug: j.slug }));
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [job, , sessionUser] = await Promise.all([getJobBySlug(slug), getAllJobs(), getSessionUser()]);
  if (!job) notFound();

  const similar = await getSimilarJobs(job, 3);
  const candidate = sessionUser ? await getCandidateByAuthUserId(sessionUser.userId) : null;
  const saved = candidate ? await isJobSaved(candidate.id, job.id) : false;

  // Jobs ingested from a government job board (features/job-ingestion) are
  // not Illoura's own vacancies — Illoura isn't the hiring organisation and
  // isn't handling applications, so both the apply flow and the structured
  // data below must point at the original source, not Illoura.
  const isExternal = job.source !== "illoura";

  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedDate,
    validThrough: job.closingDate,
    employmentType: job.type.toUpperCase(),
    identifier: {
      "@type": "PropertyValue",
      name: isExternal ? job.sourceLabel : ORGANIZATION_JSON_LD.name,
      value: job.referenceNumber,
    },
    directApply: !isExternal,
    hiringOrganization: isExternal
      ? { "@type": "Organization", name: job.sourceLabel, url: job.externalUrl }
      : {
          "@type": "Organization",
          name: ORGANIZATION_JSON_LD.name,
          url: ORGANIZATION_JSON_LD.url,
          logo: ORGANIZATION_JSON_LD.logo,
          sameAs: ORGANIZATION_JSON_LD.sameAs,
        },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressRegion: job.state,
        addressCountry: "AU",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: job.latitude,
        longitude: job.longitude,
      },
    },
    ...(job.salaryRange && {
      baseSalary: { "@type": "MonetaryAmount", currency: "AUD", value: job.salaryRange },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jobJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Jobs", href: "/jobs" },
            { label: job.title, href: `/jobs/${job.slug}` },
          ]}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Badge variant="secondary">{job.type}</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{job.title}</h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="size-4" aria-hidden="true" />
                {job.location}, {job.state}
              </span>
              <span className="flex items-center gap-1.5">
                <BriefcaseIcon className="size-4" aria-hidden="true" />
                {job.industry}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="size-4" aria-hidden="true" />
                Closes{" "}
                {new Date(job.closingDate).toLocaleDateString("en-AU", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <HashIcon className="size-4" aria-hidden="true" />
                Ref: {job.referenceNumber}
              </span>
            </div>

            {job.salaryRange && (
              <p className="mt-3 font-semibold text-primary">{job.salaryRange}</p>
            )}

            <Separator className="my-8" />

            <div className="prose prose-sm max-w-none text-foreground">
              <p className="text-muted-foreground leading-relaxed">{job.description}</p>

              <h2 className="mt-8 text-base font-semibold">Key Responsibilities</h2>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-base font-semibold">Requirements</h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>

              <h2 className="mt-8 text-base font-semibold">What&apos;s on Offer</h2>
              <ul className="mt-3 space-y-2">
                {job.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Similar roles */}
            {similar.length > 0 && (
              <>
                <Separator className="my-10" />
                <h2 className="font-semibold">Similar Roles</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/jobs/${s.slug}`}
                      className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors"
                    >
                      <p className="text-sm font-medium leading-snug">{s.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{s.location} · {s.type}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sticky apply sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-semibold">Apply for this role</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isExternal
                  ? `This role is advertised by ${job.sourceLabel}, not Illoura — apply directly on their site.`
                  : "Submit your details and a consultant will be in touch to discuss the role and next steps."}
              </p>
              {isExternal ? (
                <a
                  href={job.externalUrl}
                  target="_blank"
                  rel="noopener"
                  className={buttonVariants({ variant: "accent", className: "mt-4 w-full" })}
                >
                  View &amp; apply on {job.sourceLabel}
                </a>
              ) : (
                <Link
                  href={`/candidates/submit-cv?jobId=${job.id}&jobSlug=${job.slug}&jobTitle=${encodeURIComponent(job.title)}`}
                  className={buttonVariants({ variant: "accent", className: "mt-4 w-full" })}
                >
                  Apply Now
                </Link>
              )}
              <div className="mt-2 flex justify-center">
                <SaveJobButton
                  job={{ id: job.id, slug: job.slug, title: job.title }}
                  initialSaved={saved}
                  isSignedIn={Boolean(sessionUser)}
                />
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                Not right for you?{" "}
                <Link href="/jobs" className="text-primary hover:underline">
                  Browse all roles
                </Link>
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
              <JobLocationMap
                location={job.location}
                state={job.state}
                latitude={job.latitude}
                longitude={job.longitude}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
