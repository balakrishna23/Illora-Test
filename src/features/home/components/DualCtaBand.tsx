import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function DualCtaBand() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-xl bg-primary-foreground/5 p-8">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              For Employers
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Ready to find your next great hire?
            </h2>
            <p className="mt-3 text-primary-foreground/70">
              Register a vacancy or speak with our team about permanent,
              contract, or embedded recruitment services.
            </p>
            <Link
              href="/employers/register-vacancy"
              className={buttonVariants({
                variant: "accent",
                size: "lg",
                className: "mt-6",
              })}
            >
              Register a Vacancy
            </Link>
          </div>
          <div className="rounded-xl bg-primary-foreground/5 p-8">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              For Candidates
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Looking for your next opportunity?
            </h2>
            <p className="mt-3 text-primary-foreground/70">
              Browse live roles or submit your CV to be considered for positions
              that aren&apos;t yet advertised.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className={buttonVariants({ variant: "accent", size: "lg" })}
              >
                Browse Jobs
              </Link>
              <Link
                href="/candidates/submit-cv"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
                })}
              >
                Submit Your CV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
