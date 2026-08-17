import type { Metadata } from "next";

import { requireUser } from "@/server/auth/session";
import { getApplications, getOrCreateCandidate, getSavedJobs } from "@/features/portal/queries";
import { SavedJobsList } from "@/features/portal/components/SavedJobsList";
import { ApplicationStatusList } from "@/features/portal/components/ApplicationStatusList";

export const metadata: Metadata = {
  title: "My Portal",
  alternates: { canonical: "/portal" },
  robots: { index: false, follow: false },
};

export default async function PortalPage() {
  const session = await requireUser();
  if (!session.success) {
    // Unreachable in practice — the parent layout redirects unauthenticated
    // visitors before this page renders, and proxy.ts already gates
    // /portal(.*). Throwing (rather than a non-null assertion) keeps this
    // page correct even if that guarantee ever changes.
    throw new Error("PortalPage rendered without an authenticated session");
  }

  const candidate = await getOrCreateCandidate(session.userId, session.email);
  const [savedJobs, applications] = await Promise.all([
    getSavedJobs(candidate.id),
    getApplications(candidate.id),
  ]);

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="text-xl font-semibold">Saved jobs</h2>
        <div className="mt-4">
          <SavedJobsList savedJobs={savedJobs} />
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="mt-4">
          <ApplicationStatusList applications={applications} />
        </div>
      </section>
    </div>
  );
}
