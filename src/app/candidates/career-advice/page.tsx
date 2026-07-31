import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getArticlesByCategory } from "@/features/knowledge-hub/queries";

export const metadata: Metadata = {
  title: "Career Advice",
  description:
    "Practical career advice for candidates — CV tips, interview preparation, and how to navigate the job market in 2026.",
};

const TIPS = [
  {
    title: "Quantify your impact",
    description:
      "Numbers convert résumés from descriptions to proof. 'Managed a team' becomes 'Managed a team of 8 engineers delivering a $4M migration on time and 3% under budget.' Every bullet point should answer: so what?",
  },
  {
    title: "Prepare for the culture round",
    description:
      "Behavioural interviews count as much as technical rounds. Prepare STAR-format examples for: receiving critical feedback, managing competing priorities, handling conflict, and demonstrating initiative without being asked.",
  },
  {
    title: "Research the actual tech stack",
    description:
      "Most job descriptions list technologies. Go deeper — check GitHub repos, the company engineering blog, recent job ads. Understanding the problems they're solving matters more than generic algorithm drills.",
  },
  {
    title: "Don't skip the cover letter",
    description:
      "A tailored two-paragraph cover note that references a specific aspect of the role or organisation consistently outperforms a generic submission. It demonstrates research and communication skills simultaneously.",
  },
  {
    title: "Negotiate after the offer",
    description:
      "The best time to negotiate is after an offer is made, not during initial conversations. Know your market rate, have a range in mind, and be prepared to justify with evidence — not just preference.",
  },
  {
    title: "Use your consultant",
    description:
      "Your Illora consultant has spoken with the hiring manager and knows what matters most to them. Ask for specific interview prep, not generic advice. We'll tell you what we know.",
  },
];

export default async function CareerAdvicePage() {
  const candidateArticles = await getArticlesByCategory("Candidate Advice");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "For Candidates", href: "/candidates" },
          { label: "Career Advice", href: "/candidates/career-advice" },
        ]}
      />

      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">Career Advice</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Navigate the job market with confidence.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Practical advice from our consultants — not generic tips, but what we
          actually observe makes the difference between candidates who get offers
          and those who don&apos;t.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TIPS.map(({ title, description }) => (
          <Card key={title} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 p-6">
              <h2 className="font-semibold">{title}</h2>
              <p className="flex-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Articles from Knowledge Hub */}
      {candidateArticles.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">From the Knowledge Hub</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {candidateArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/knowledge-hub/${article.slug}`}
                className="group block rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <p className="text-xs text-muted-foreground">{article.readingTimeMinutes} min read</p>
                <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read more <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 rounded-2xl bg-primary p-10 text-primary-foreground">
        <h2 className="text-2xl font-semibold">Ready to take the next step?</h2>
        <p className="mt-2 text-primary-foreground/70">
          Browse live roles or submit your CV to be considered for upcoming
          positions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/jobs" className={buttonVariants({ variant: "accent" })}>
            Browse Jobs
          </Link>
          <Link
            href="/candidates/submit-cv"
            className={buttonVariants({
              variant: "outline",
              className: "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10",
            })}
          >
            Submit Your CV
          </Link>
        </div>
      </div>
    </div>
  );
}
