"use client";

import { useTransition } from "react";

import { NativeSelect as Select } from "@/components/ui/native-select";
import { contactMessageStatusValues } from "@/server/db/schema";
import { updateContactMessageStatus } from "@/features/admin/messages/actions";

export function ContactMessageStatusSelect({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const status = e.target.value;
        startTransition(async () => {
          await updateContactMessageStatus(id, status);
        });
      }}
      className="text-sm"
    >
      {contactMessageStatusValues.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </Select>
  );
}
