"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPassword, type ResetPasswordState } from "@/features/auth/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function ResetPasswordForm() {
  const [state, action, isPending] = useActionState<ResetPasswordState, FormData>(resetPassword, null);
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid w-full max-w-sm gap-4">
      <h1 className="text-xl font-semibold">Set a new password</h1>

      {state?.success === false && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="mt-1"
          required
          autoComplete="new-password"
        />
        <FieldError errors={fieldErrors.password} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="mt-1"
          required
          autoComplete="new-password"
        />
        <FieldError errors={fieldErrors.confirmPassword} />
      </div>

      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
