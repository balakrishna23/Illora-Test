import Link from "next/link";
import { MapPinIcon, BriefcaseIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Job } from "@/server/integrations/jobadder";

type Props = {
  slug: string;
  name: string;
  overview: string[];
  roles: string[];
  jobs: Job[];
};

export function IndustrySectorPage({ slug, name, overview, roles, jobs }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Industries", href: "/industries" },
          { label: name, href: `/industries/${slug}` },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Industry
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {name}
          </h1>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            {overview.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-semibold">Roles we typically place</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-sm">
                {role}
              </Badge>
            ))}
          </div>

          {jobs.length > 0 && (
            <>
              <h2 className="mt-12 text-xl font-semibold">
                Live {name} roles
              </h2>
              <div className="mt-4 grid gap-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="group">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <h3 className="font-semibold group-hover:text-primary">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="size-3.5" aria-hidden="true" />
                            {job.location}, {job.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="size-3.5" aria-hidden="true" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        View
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold">Hiring in {name}?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Register a vacancy and a specialist consultant will be in touch within one business day.
              </p>
              <Link
                href="/employers/register-vacancy"
                className={buttonVariants({ className: "mt-4 w-full" })}
              >
                Register a Vacancy
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold">Looking for work?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse all live {name} roles or submit your CV.
              </p>
              <Link
                href={`/jobs?industry=${encodeURIComponent(name)}`}
                className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
              >
                Browse {name} jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
