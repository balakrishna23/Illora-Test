"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

import { buttonVariants } from "@/components/ui/button";

export function AccountNavButton() {
  return (
    <>
      <Show when="signed-in">
        <Link href="/admin" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Admin
        </Link>
        <Link href="/portal" className={buttonVariants({ variant: "outline", size: "sm" })}>
          My Portal
        </Link>
        <UserButton />
      </Show>
      <Show when="signed-out">
        <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Sign In
        </Link>
      </Show>
    </>
  );
}
