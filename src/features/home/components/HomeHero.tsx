import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { HeroIllustration } from "@/components/shared/HeroIllustration";
import type { SiteStats } from "@/server/integrations/sanity";

export function HomeHero({ stats }: { stats: SiteStats }) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            Supply Nation Certified · First Nations Owned
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Recruitment that delivers real outcomes — for people and employers.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
            {stats.candidatesPlaced.toLocaleString()}+ placements across seven
            specialist sectors, Australia-wide.{" "}
            {stats.clientRetentionPct}% client retention. {stats.yearsOperating}{" "}
            years operating across Australia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Find a Job
            </Link>
            <Link
              href="/employers/register-vacancy"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Hire Talent
            </Link>
          </div>
        </div>
        <div className="hidden lg:block" aria-hidden="true">
          <HeroIllustration />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-accent/10 to-transparent"
      />
    </section>
  );
}
