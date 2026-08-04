"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { changePassword, type AccountActionState } from "@/features/portal/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function ChangePasswordForm() {
  const [state, action, isPending] = useActionState<AccountActionState, FormData>(
    changePassword,
    null
  );
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-4">
      <h2 className="text-lg font-semibold">Change password</h2>

      {state && (
        <p
          role="status"
          className={`rounded-md px-3 py-2 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-destructive/10 text-destructive"}`}
        >
          {state.success ? state.message : state.error}
        </p>
      )}

      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="mt-1"
          required
          autoComplete="current-password"
        />
        <FieldError errors={fieldErrors.currentPassword} />
      </div>

      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          className="mt-1"
          required
          autoComplete="new-password"
        />
        <FieldError errors={fieldErrors.newPassword} />
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

      <Button type="submit" variant="accent" disabled={isPending} className="justify-self-start">
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
