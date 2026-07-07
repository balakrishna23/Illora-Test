import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon, FileTextIcon, GraduationCapIcon, HeartHandshakeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getAllJobs, JOB_INDUSTRIES } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "For Candidates",
  description:
    "Browse live jobs or submit your CV. Illora supports candidates through every step — sourcing, interview prep, and beyond.",
};

const SUPPORT_ITEMS = [
  {
    icon: SearchIcon,
    title: "Transparent sourcing",
    description:
      "We tell you exactly which roles you're being put forward for, what the client knows about you, and what the process looks like. No surprises, no silent rejections.",
  },
  {
    icon: GraduationCapIcon,
    title: "Interview preparation",
    description:
      "Before every interview, your consultant briefs you on the organisation, the panel, the likely questions, and what the client values most. We want you to walk in prepared, not anxious.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Post-placement support",
    description:
      "We check in at 30, 60, and 90 days after you start. If something isn't working, we'd rather know early and address it than have you quietly look for something else.",
  },
  {
    icon: FileTextIcon,
    title: "CV and positioning advice",
    description:
      "We'll give you an honest read on how your CV presents and how to position your experience for the roles that suit you — not just a generic polish.",
  },
];

export default async function CandidatesPage() {
  const jobs = await getAllJobs();
  const industryCounts = JOB_INDUSTRIES.map((industry) => ({
    industry,
    count: jobs.filter((j) => j.industry === industry).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "For Candidates", href: "/candidates" },
        ]}
      />

      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">For Candidates</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          We find roles worth taking.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Not every agency works for the candidate as hard as it works for the
          client. We do both — because the only way a placement works long-term
          is if it&apos;s genuinely right for the person in the role.
        </p>
      </div>

      {/* Live job counts */}
      <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="font-semibold">Live roles right now</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {industryCounts.map(({ industry, count }) => (
            <div key={industry} className="rounded-lg bg-card border border-border px-4 py-3">
              <p className="text-2xl font-semibold text-primary">{count}</p>
              <p className="text-sm text-muted-foreground">{industry}</p>
            </div>
          ))}
        </div>
        <Link href="/jobs" className={buttonVariants({ variant: "accent", className: "mt-5" })}>
          Browse all jobs
        </Link>
      </div>

      {/* How we support you */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight">How we support you</h2>
        <p className="mt-2 text-muted-foreground">
          From first call to 90 days in the role.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {SUPPORT_ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="size-6 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dual path CTA */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-primary p-8 text-primary-foreground">
          <h2 className="text-xl font-semibold">Browse live jobs</h2>
          <p className="mt-2 text-primary-foreground/70 text-sm">
            Search and filter {jobs.length} current opportunities across our seven specialist sectors.
          </p>
          <Link
            href="/jobs"
            className={buttonVariants({
              variant: "accent",
              size: "lg",
              className: "mt-5",
            })}
          >
            View all jobs
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="text-xl font-semibold">Submit your CV</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Don&apos;t see the right role? Submit your CV to be considered for
            positions that haven&apos;t been advertised yet.
          </p>
          <Link
            href="/candidates/submit-cv"
            className={buttonVariants({ variant: "accent", size: "lg", className: "mt-5" })}
          >
            Submit your CV
          </Link>
        </div>
      </div>
    </div>
  );
}
