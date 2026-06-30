import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MobileNav } from "@/components/shared/MobileNav";
import { primaryNavLinks } from "@/lib/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-primary">Illora</span>
          <span className="hidden text-xs text-accent font-medium sm:block">Supply Nation Certified</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
