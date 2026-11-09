import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MobileNav } from "@/components/shared/MobileNav";
import { DesktopNav } from "@/components/shared/DesktopNav";
import { IllouraLogo } from "@/components/shared/IllouraLogo";
import { AccountNavButton } from "@/components/shared/AccountNavButton";
import { getSessionUser, isAdminEmail } from "@/server/auth/session";

export async function Header() {
  const sessionUser = await getSessionUser();
  const isSignedIn = Boolean(sessionUser);
  const isAdmin = sessionUser ? isAdminEmail(sessionUser.email) : false;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Aboriginal flag–inspired earth stripe: charcoal | terracotta | golden ochre */}
      <div className="flex h-0.75" aria-hidden="true">
        <div className="flex-1" style={{ background: "oklch(0.17 0.04 30)" }} />
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-accent" />
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <IllouraLogo className="h-10 w-10 shrink-0" />
          <span className="text-base font-semibold tracking-tight text-foreground">Illoura Services</span>
          <span className="hidden rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent font-medium sm:block">Supply Nation Registered</span>
        </Link>

        <DesktopNav />

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Search Jobs
          </Link>
          <Link
            href="/employers/register-vacancy"
            className={buttonVariants({ variant: "accent", size: "sm" })}
          >
            Hire Talent
          </Link>
          <AccountNavButton isSignedIn={isSignedIn} isAdmin={isAdmin} />
        </div>

        <MobileNav isSignedIn={isSignedIn} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
