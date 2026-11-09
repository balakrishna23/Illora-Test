import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { INDUSTRIES } from "@/lib/industries";
import { getAllJobs } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Specialist recruitment for AI Engineering, Cyber Security, and Data Analytics.",
  alternates: { canonical: "/industries" },
};

export default async function IndustriesPage() {
  const jobs = await getAllJobs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/industries" },
        ]}
      />
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Industries</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          We specialise in three technology disciplines. That focus means we know
          the market, we know the candidates, and we understand the work.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.map(({ slug, name, icon: Icon, shortDescription }) => {
          const count = jobs.filter((j) => j.industry === name).length;
          return (
            <Link
              key={slug}
              href={`/industries/${slug}`}
              className="group rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h2 className="font-semibold group-hover:text-primary">{name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{shortDescription}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-accent">{count} live role{count !== 1 ? "s" : ""}</span>
                <ArrowRightIcon className="size-4 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
