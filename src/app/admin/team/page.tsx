import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getAllTeamAdmin } from "@/features/admin/team/queries";
import { TeamRowActions } from "@/features/admin/team/components/TeamRowActions";

export const metadata: Metadata = {
  title: "Admin — Team",
};

export default async function AdminTeamPage() {
  const team = await getAllTeamAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team ({team.length})</h2>
        <Link href="/admin/team/new" className={buttonVariants({ variant: "accent", size: "sm" })}>
          New team member
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Order</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/admin/team/${member.id}`} className="font-medium hover:text-primary">
                    {member.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{member.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{member.sortOrder}</td>
                <td className="px-4 py-3">
                  <TeamRowActions id={member.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
