import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";

import { getApplications, getOrCreateCandidate, getSavedJobs } from "@/features/portal/queries";
import { SavedJobsList } from "@/features/portal/components/SavedJobsList";
import { ApplicationStatusList } from "@/features/portal/components/ApplicationStatusList";

export const metadata: Metadata = {
  title: "My Portal",
};

export default async function PortalPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;

  // userId/email are guaranteed here: the parent layout redirects unauthenticated
  // visitors before this page renders, and proxy.ts already gates /portal(.*).
  const candidate = await getOrCreateCandidate(userId!, email!);
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
