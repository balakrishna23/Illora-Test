import type { Metadata } from "next";

import { TeamForm } from "@/features/admin/team/components/TeamForm";

export const metadata: Metadata = {
  title: "Admin — New Team Member",
};

export default function AdminNewTeamMemberPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">New team member</h2>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <TeamForm />
      </div>
    </div>
  );
}
