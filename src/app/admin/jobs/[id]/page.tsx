import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getJobByIdAdmin } from "@/features/admin/jobs/queries";
import { JobForm } from "@/features/admin/jobs/components/JobForm";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Admin — Edit Job",
};

export default async function AdminEditJobPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJobByIdAdmin(id);
  if (!job) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold">Edit job</h2>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
