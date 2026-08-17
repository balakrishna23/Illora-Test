import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { VacancyForm } from "@/features/employers/components/VacancyForm";

export const metadata: Metadata = {
  title: "Embedded / RPO Recruitment",
  description:
    "An embedded Illoura recruiter inside your business for high-volume or ongoing hiring — specialist expertise without the internal overhead.",
  alternates: { canonical: "/employers/embedded-rpo" },
};

const FAQS = [
  {
    q: "What volume of hiring makes embedded RPO worthwhile?",
    a: "As a guide, embedded RPO delivers strong ROI for businesses with five or more hires per year in our core sectors. Below that threshold, a retained or contingent model typically offers better value. We'll tell you honestly which model suits your situation.",
  },
  {
    q: "Will the recruiter work exclusively on our roles?",
    a: "For full embedded engagements, yes — a named consultant is dedicated to your account. For lighter-touch arrangements, we can offer part-time embedded capacity (e.g., 3 days per week) while managing the engagement as a priority account.",
  },
  {
    q: "How is the embedded recruiter aligned to our employer brand?",
    a: "Your embedded consultant will be trained on your brand, values, EVP, and culture before engaging any candidates. They attend your team meetings, use your ATS, and present as an extension of your HR or talent team — not as an external agency.",
  },
  {
    q: "What does the contract term look like?",
    a: "We typically recommend a 6-month initial term with a 30-day exit clause after month three. Most clients renew, but we don't lock you in. Performance is monitored monthly against agreed KPIs (time-to-shortlist, offer acceptance rate, retention at 90 days).",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function EmbeddedRpoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "For Employers", href: "/employers" },
            { label: "Embedded / RPO", href: "/employers/embedded-rpo" },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Embedded / RPO</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              A dedicated recruiter, inside your business.
            </h1>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                If your business hires regularly or in volume, an embedded recruitment
                model gives you specialist capability without the overhead of building
                an internal talent function. An Illoura consultant works as part of your
                team — aligned to your brand, your ATS, and your culture — but with the
                network, systems, and expertise of a specialist agency behind them.
              </p>
              <p>
                Our embedded and RPO arrangements are suited to businesses in scale-up
                phases, organisations navigating high-turnover sectors, and any employer
                with sustained hiring demand (typically five or more roles per year in
                our core sectors).
              </p>
              <p>
                Unlike traditional RPO arrangements that can take months to stand up,
                we&apos;re typically operational within three weeks of engagement. We
                benchmark performance monthly and provide full pipeline reporting so
                you have visibility at all times.
              </p>
            </div>

            <h2 className="mt-10 text-xl font-semibold">What&apos;s included</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Named dedicated consultant (full-time or part-time capacity)",
                "Full employer-brand alignment and EVP integration",
                "Embedded access to your ATS or use of Illoura's platform",
                "End-to-end process from brief to placement",
                "Monthly pipeline reporting and KPI dashboards",
                "Scalable capacity — ramp up/down as volumes change",
                "Cultural and retention advisory support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-xl bg-muted/50 p-6">
              <h2 className="font-semibold">Outcome example</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A healthcare provider operating 12 aged care facilities across Victoria
                engaged Illoura under an embedded RPO model to manage their nursing
                recruitment. Previously, nursing vacancies were filled through multiple
                agencies with no consistency in candidate quality or cultural fit.
                Within six months of the embedded engagement, average time-to-fill
                dropped from 34 days to 18 days, and first-year attrition reduced by
                28% — a result the organisation attributed directly to improved
                screening and cultural alignment during the recruitment process.
              </p>
            </div>

            <h2 className="mt-12 text-xl font-semibold">Frequently asked questions</h2>
            <Accordion className="mt-4">
              {FAQS.map(({ q, a }, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">{q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold">Interested in embedded RPO?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Let us know about your hiring volumes and we&apos;ll put together a proposal.</p>
              <Link href="/contact" className={buttonVariants({ variant: "accent", className: "mt-4 w-full" })}>
                Start a conversation
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-semibold">Tell us about your hiring needs</h2>
          <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
            <VacancyForm serviceType="Embedded RPO" />
          </div>
        </div>
      </div>
    </>
  );
}
