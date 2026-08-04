import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";

export function AccountNavButton({
  isSignedIn,
  isAdmin,
}: {
  isSignedIn: boolean;
  isAdmin: boolean;
}) {
  if (!isSignedIn) {
    return (
      <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "sm" })}>
        Sign In
      </Link>
    );
  }

  return (
    <>
      {isAdmin && (
        <Link href="/admin" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Admin
        </Link>
      )}
      <Link href="/portal" className={buttonVariants({ variant: "outline", size: "sm" })}>
        My Portal
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
    </>
  );
}
