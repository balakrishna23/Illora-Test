"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { changeEmail, type AccountActionState } from "@/features/portal/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action, isPending] = useActionState<AccountActionState, FormData>(
    changeEmail,
    null
  );
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-lg font-semibold">Change email</h2>
      <p className="text-sm text-muted-foreground">Current email: {currentEmail}</p>

      {state && (
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-destructive/10 text-destructive"}`}
        >
          {state.success ? state.message : state.error}
        </p>
      )}

      <div>
        <Label htmlFor="newEmail">New email</Label>
        <Input id="newEmail" name="newEmail" type="email" className="mt-1" required />
        <FieldError errors={fieldErrors.newEmail} />
      </div>

      <Button type="submit" variant="accent" disabled={isPending} className="justify-self-start">
        {isPending ? "Updating…" : "Update email"}
      </Button>
    </form>
  );
}
