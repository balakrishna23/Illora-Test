import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { INDUSTRIES } from "@/lib/industries";
import { Reveal } from "@/components/shared/Reveal";
import { DotDivider } from "@/components/shared/DotDivider";

export function IndustryTiles() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
            Sectors We Specialise In
          </h2>
          <p className="mt-2 text-muted-foreground">
            Deep knowledge. Real networks. Genuine outcomes.
          </p>
        </Reveal>
        <DotDivider className="mt-6 mb-2" count={29} />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map(({ slug, name, icon: Icon, shortDescription }, i) => (
            <Reveal key={slug} delay={i * 75} animation="scale-in">
              <Link
                href={`/industries/${slug}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent/40 hover:shadow-accent/10"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-linear-to-br from-accent/20 to-primary/15 text-primary ring-2 ring-accent/20 transition-all duration-200 group-hover:ring-accent/50 group-hover:from-accent/30">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold group-hover:text-primary">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{shortDescription}</p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-primary">
                  Explore roles
                  <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
