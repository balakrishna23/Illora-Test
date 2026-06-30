"use client";

import { useActionState } from "react";
import { CheckCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestCapabilityStatement } from "@/features/about/actions";

type State = { success: true } | { success: false; error: string } | null;

export function CapabilityEmailForm() {
  const [state, action, isPending] = useActionState<State, FormData>(
    requestCapabilityStatement,
    null
  );

  if (state?.success) {
    return (
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="size-6 text-green-600" aria-hidden="true" />
        <p className="text-sm font-medium">
          Sent — check your inbox for the capability statement.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="capName">Name</Label>
        <Input id="capName" name="name" className="mt-1" required />
      </div>
      <div className="flex-1">
        <Label htmlFor="capEmail">Work email</Label>
        <Input id="capEmail" name="email" type="email" className="mt-1" required />
      </div>
      <Button type="submit" variant="accent" disabled={isPending} className="sm:self-end">
        {isPending ? "Sending…" : "Send me the PDF"}
      </Button>
      {state?.success === false && (
        <p className="text-xs text-destructive mt-1">{state.error}</p>
      )}
    </form>
  );
}
