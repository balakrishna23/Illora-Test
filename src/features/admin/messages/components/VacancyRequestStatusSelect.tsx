"use client";

import { useTransition } from "react";

import { NativeSelect as Select } from "@/components/ui/native-select";
import { vacancyRequestStatusValues } from "@/server/db/schema";
import { updateVacancyRequestStatus } from "@/features/admin/messages/actions";

export function VacancyRequestStatusSelect({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value;
        startTransition(async () => {
          await updateVacancyRequestStatus(id, status);
        });
      }}
      className="text-sm"
    >
      {vacancyRequestStatusValues.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </Select>
  );
}
