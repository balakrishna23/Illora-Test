import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTeamMemberByIdAdmin } from "@/features/admin/team/queries";
import { TeamForm } from "@/features/admin/team/components/TeamForm";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Admin — Edit Team Member",
};

export default async function AdminEditTeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getTeamMemberByIdAdmin(id);
  if (!member) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold">Edit team member</h2>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <TeamForm member={member} />
      </div>
    </div>
  );
}
