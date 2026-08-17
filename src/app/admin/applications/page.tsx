import type { Metadata } from "next";

import { getAllApplications } from "@/features/admin/applications/queries";
import {
  ApplicationsTable,
  type AdminApplicationRow,
} from "@/features/admin/applications/components/ApplicationsTable";

export const metadata: Metadata = {
  title: "Admin — Applications",
  robots: { index: false, follow: false },
};

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();

  // Convert the storage keys to booleans here so the actual keys never cross
  // the server/client boundary — downloads/reviews are signed/run on demand,
  // admin-gated.
  const rows: AdminApplicationRow[] = applications.map((application) => ({
    id: application.id,
    name: application.name,
    email: application.email,
    phone: application.phone,
    targetIndustry: application.targetIndustry,
    securityClearance: application.securityClearance,
    status: application.status,
    submittedAt: application.submittedAt.toISOString(),
    jobSlug: application.liveJobSlug ?? application.jobSlug,
    jobTitle: application.liveJobTitle ?? application.jobTitle,
    hasResume: Boolean(application.resumeStorageKey),
    hasCoverLetter: Boolean(application.coverLetterStorageKey),
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold">Applications ({rows.length})</h2>
      <ApplicationsTable applications={rows} />
    </div>
  );
}
