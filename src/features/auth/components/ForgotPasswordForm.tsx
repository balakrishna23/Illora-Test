"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, type RequestPasswordResetState } from "@/features/auth/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState<RequestPasswordResetState, FormData>(
    requestPasswordReset,
    null
  );
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  if (state?.success) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 py-10 text-center">
        <CheckCircleIcon className="size-12 text-green-600" aria-hidden="true" />
        <h1 className="text-lg font-semibold">Check your email</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid w-full max-w-sm gap-4">
      <h1 className="text-xl font-semibold">Reset your password</h1>
      <p className="text-sm text-muted-foreground">
        Enter the email address on your account and we&apos;ll send you a link to reset your password.
      </p>

      {state?.success === false && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" className="mt-1" required autoComplete="email" />
        <FieldError errors={fieldErrors.email} />
      </div>

      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
