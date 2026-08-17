import type { Metadata } from "next";

import { JobForm } from "@/features/admin/jobs/components/JobForm";

export const metadata: Metadata = {
  title: "Admin — New Job",
  robots: { index: false, follow: false },
};

export default function AdminNewJobPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">New job</h2>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <JobForm />
      </div>
    </div>
  );
}
