"use client";

import { useTransition } from "react";

import { NativeSelect as Select } from "@/components/ui/native-select";
import { applicationStatusValues } from "@/server/db/schema";
import { updateApplicationStatus } from "@/features/admin/applications/actions";

export function ApplicationStatusSelect({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value;
        startTransition(async () => {
          await updateApplicationStatus(id, status);
        });
      }}
      className="text-sm"
    >
      {applicationStatusValues.map((value) => (
        <option key={value} value={value}>
          {value.replace("_", " ")}
        </option>
      ))}
    </Select>
  );
}
