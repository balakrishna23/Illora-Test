"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import { NAV_ITEMS, type NavItem } from "@/lib/navigation";

function DropdownPanel({ item }: { item: NavItem }) {
  if (!item.items) return null;
  return (
    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 animate-dropdown-in">
      <div className="min-w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        {item.items.map((sub) => (
          <Link
            key={sub.href}
            href={sub.href}
            className="group/sub flex flex-col px-4 py-2.5 transition-colors hover:bg-muted first:pt-3 last:pb-3"
          >
            <span className="text-sm font-medium text-foreground transition-colors group-hover/sub:text-primary">
              {sub.label}
            </span>
            {sub.description && (
              <span className="mt-0.5 text-xs text-muted-foreground">{sub.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavEntry({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="nav-underline text-sm font-medium text-foreground/75 transition-colors hover:text-foreground px-1 py-1"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="nav-underline flex items-center gap-1 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground px-1 py-1"
      >
        {item.label}
        <ChevronDownIcon
          className={`size-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <DropdownPanel item={item} />}
    </div>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => (
        // Keying on pathname remounts each entry on route change, resetting
        // `open` to false — avoids an effect just to close the dropdown.
        <NavEntry key={`${item.label}-${pathname}`} item={item} />
      ))}
    </nav>
  );
}
