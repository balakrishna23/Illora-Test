"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/lib/navigation";
import { signOut } from "@/features/auth/actions";

export function MobileNav({
  isSignedIn,
  isAdmin,
}: {
  isSignedIn: boolean;
  isAdmin: boolean;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function close() {
    setSheetOpen(false);
    setExpanded(null);
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" />}
        className="lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent side="right" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile primary" className="mt-4 flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              );
            }

            const isOpen = expanded === item.label;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : item.label)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                  <ChevronDownIcon
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-primary/20 pl-3 animate-dropdown-in">
                    {item.items?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={close}
                        className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA pair */}
        <div className="mt-6 flex flex-col gap-2 px-2">
          <Link
            href="/jobs"
            onClick={close}
            className="rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            Search Jobs
          </Link>
          <Link
            href="/employers/register-vacancy"
            onClick={close}
            className="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/85"
          >
            Hire Talent
          </Link>
          {isSignedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/portal"
                onClick={close}
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
              >
                My Portal
              </Link>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={close}
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/sign-in"
              onClick={close}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-muted"
            >
              Sign In
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
