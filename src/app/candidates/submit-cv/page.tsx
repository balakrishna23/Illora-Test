import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SubmitCvForm } from "@/features/candidates/components/SubmitCvForm";
import { findExistingApplicationForCandidate } from "@/features/candidates/queries";
import { getCandidateByAuthUserId } from "@/features/portal/queries";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Submit Your CV",
  description:
    "Submit your CV to Illora and be considered for upcoming roles across our seven specialist sectors, including IT & Telecommunications, Construction, and Healthcare.",
  alternates: { canonical: "/candidates/submit-cv" },
};

type SearchParams = Promise<{ jobId?: string; jobSlug?: string; jobTitle?: string }>;

export default async function SubmitCvPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { jobId, jobSlug, jobTitle } = await searchParams;

  // Signed-in candidates with a submission already on file get a warning
  // that submitting again replaces it (enforced in the submitCv action).
  let existingSubmittedAt: string | undefined;
  const session = await requireUser();
  if (session.success) {
    const candidate = await getCandidateByAuthUserId(session.userId);
    if (candidate) {
      const existing = await findExistingApplicationForCandidate(
        candidate.id,
        session.email,
        jobId || null
      );
      existingSubmittedAt = existing?.submittedAt.toISOString();
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "For Candidates", href: "/candidates" },
          { label: "Submit Your CV", href: "/candidates/submit-cv" },
        ]}
      />

      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">For Candidates</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Submit Your CV</h1>
        <p className="mt-3 text-muted-foreground">
          Don&apos;t see the right role advertised? Submit your CV and we&apos;ll
          contact you when a position matching your experience becomes available.
          Every submission is reviewed by a consultant — you won&apos;t fall into
          a database never to be heard from again.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <SubmitCvForm
          jobId={jobId}
          jobSlug={jobSlug}
          jobTitle={jobTitle}
          existingSubmittedAt={existingSubmittedAt}
        />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Resumes are stored securely and only shared with prospective employers
        with your explicit consent. See our{" "}
        <a href="/privacy-policy" className="underline hover:text-foreground">
          Privacy Policy
        </a>{" "}
        for full details.
      </p>
    </div>
  );
}
