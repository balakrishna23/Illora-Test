import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { VacancyForm } from "@/features/employers/components/VacancyForm";

export const metadata: Metadata = {
  title: "Contract & Labour Hire",
  description:
    "Flexible contract and labour hire staffing across our seven specialist sectors, including IT & Telecommunications, Construction, and Healthcare.",
  alternates: { canonical: "/employers/contract" },
};

const FAQS = [
  {
    q: "How quickly can you mobilise a contractor?",
    a: "For most contract roles, we can present a shortlist within 24–48 hours and have a candidate on-site or on-contract within 5 business days, subject to background checks and induction requirements. For roles requiring security clearances, this extends accordingly.",
  },
  {
    q: "Who employs the contractor — us or Illoura?",
    a: "Under our labour hire model, Illoura is the employer of record. We manage payroll, superannuation, leave entitlements, and WorkCover obligations. You pay an agreed rate and manage the day-to-day work. This reduces your administrative burden and ensures full compliance.",
  },
  {
    q: "What WHS obligations do you manage?",
    a: "We coordinate SWMS, site-specific inductions, PPE requirements, and licence verification. For construction and healthcare placements, we also conduct pre-employment medicals and background checks as required by the role and site.",
  },
  {
    q: "Can a contractor convert to a permanent hire?",
    a: "Yes — and this is a common outcome. Many clients use contract engagements as an extended working interview. We support conversion to permanent arrangements transparently, with fee structures adjusted accordingly.",
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

export default function ContractRecruitmentPage() {
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
            { label: "Contract & Labour Hire", href: "/employers/contract" },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Contract & Labour Hire</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Flexible talent, on demand.
            </h1>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Project timelines spike. Key staff go on leave. New platforms need
                temporary specialist capability. Contract and labour hire staffing
                gives you the flexibility to respond to these realities without the
                overhead of a permanent headcount decision.
              </p>
              <p>
                Illoura provides compliant on-hire arrangements across IT &amp;
                Telecommunications, Construction, and Healthcare. We act as the
                employer of record — managing payroll, superannuation, WHS compliance,
                and all the administrative obligations — while you direct the work.
              </p>
              <p>
                Our contract candidates are screened with the same rigour as our
                permanent placements. Speed matters in contracting, but so does
                quality — and we don&apos;t sacrifice one for the other.
              </p>
            </div>

            <h2 className="mt-10 text-xl font-semibold">What&apos;s included</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Rapid sourcing and screening — shortlist within 24–48 hours for most roles",
                "Compliant on-hire employment (payroll, super, WorkCover)",
                "SWMS, site induction, and WHS coordination",
                "Licence and credential verification",
                "Pre-employment medicals where required",
                "Ongoing contractor performance monitoring",
                "Timesheet and invoicing management",
                "Seamless conversion to permanent where required",
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
                A Tier 2 construction company needed four additional labourers and a
                crane operator for a six-week commercial fitout. Their existing
                subcontractor had pulled resources to a larger project. Illoura mobilised
                five workers within three business days — fully inducted, with compliant
                SWMS in place — and the project finished on programme.
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
              <h2 className="font-semibold">Need a contractor?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Register your requirement and we&apos;ll have a shortlist to you within 48 hours.</p>
              <Link href="/employers/register-vacancy" className={buttonVariants({ variant: "accent", className: "mt-4 w-full" })}>
                Register a Vacancy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-semibold">Register a Contract Requirement</h2>
          <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
            <VacancyForm serviceType="Contract" />
          </div>
        </div>
      </div>
    </>
  );
}
