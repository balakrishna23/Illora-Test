"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteTeamMember } from "@/features/admin/team/actions";

export function TeamRowActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Remove this team member? This cannot be undone.")) {
          startTransition(async () => {
            await deleteTeamMember(id);
          });
        }
      }}
    >
      Delete
    </Button>
  );
}
