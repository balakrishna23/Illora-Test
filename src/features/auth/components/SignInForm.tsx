"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn, type SignInState } from "@/features/auth/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, isPending] = useActionState<SignInState, FormData>(signIn, null);
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid w-full max-w-sm gap-4">
      <h1 className="text-xl font-semibold">Sign in</h1>

      {state?.success === false && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" className="mt-1" required autoComplete="email" />
        <FieldError errors={fieldErrors.email} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          className="mt-1"
          required
          autoComplete="current-password"
        />
        <FieldError errors={fieldErrors.password} />
      </div>

      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
