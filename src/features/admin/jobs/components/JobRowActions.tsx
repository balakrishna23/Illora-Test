"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { approveJob, closeJob, deleteJob, rejectJob } from "@/features/admin/jobs/actions";

export function JobRowActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {status === "pending" && (
        <>
          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await approveJob(id);
              })
            }
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await rejectJob(id);
              })
            }
          >
            Reject
          </Button>
        </>
      )}
      {status === "active" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await closeJob(id);
            })
          }
        >
          Close
        </Button>
      )}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this job permanently? This cannot be undone.")) {
            startTransition(async () => {
              await deleteJob(id);
            });
          }
        }}
      >
        Delete
      </Button>
    </div>
  );
}
