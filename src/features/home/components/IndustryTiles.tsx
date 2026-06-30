import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { INDUSTRIES } from "@/lib/industries";

export function IndustryTiles() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Sectors We Specialise In
        </h2>
        <p className="mt-2 text-muted-foreground">
          Deep knowledge. Real networks. Genuine outcomes.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map(({ slug, name, icon: Icon, shortDescription }) => (
            <Link
              key={slug}
              href={`/industries/${slug}`}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold group-hover:text-primary">{name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{shortDescription}</p>
              <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Explore roles
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
