import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { VacancyForm } from "@/features/employers/components/VacancyForm";

export const metadata: Metadata = {
  title: "Permanent Recruitment",
  description:
    "End-to-end permanent recruitment across our seven specialist sectors, including IT & Telecommunications, Construction, and Healthcare, across Australia.",
};

const FAQS = [
  {
    q: "What information do you need from me to start a search?",
    a: "A brief covering the role title, reporting structure, key responsibilities, must-have experience, salary range, and the two or three things that would make a candidate exceptional rather than merely suitable. The more context you give us, the faster and more accurately we can source.",
  },
  {
    q: "How long does a typical permanent placement take?",
    a: "For most roles at the mid-senior level, we present an initial shortlist within 5–10 business days of receiving a confirmed brief. Time-to-offer is typically 3–5 weeks, depending on your interview process. For highly specialised or scarce skill sets, we'll give you an honest market assessment upfront.",
  },
  {
    q: "What is your replacement guarantee?",
    a: "We offer a 90-day replacement guarantee on all permanent placements. If the placement doesn't work out within the first 90 days for reasons related to the candidate's fit or performance, we will conduct a replacement search at no additional charge.",
  },
  {
    q: "Do you work on exclusive or retained mandates?",
    a: "We work on both exclusive and non-exclusive arrangements, depending on the role and your preference. For senior or specialist searches, we recommend an exclusive or retained model — it allows us to invest more deeply in the search and gives you a more committed, thorough process.",
  },
  {
    q: "Can you recruit for roles outside your core sectors?",
    a: "Our core sectors are IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. While we occasionally assist with adjacent disciplines, we're honest when a role falls outside our genuine area of expertise — and we'll say so rather than taking on work we can't do well.",
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

export default function PermanentRecruitmentPage() {
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
            { label: "Permanent Recruitment", href: "/employers/permanent" },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">Permanent Recruitment</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              The right person. First time.
            </h1>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A permanent hire is one of the highest-stakes decisions a business makes.
                Get it right and you gain capability, culture, and momentum. Get it wrong
                and you absorb the cost — in time, money, and team disruption — for months.
              </p>
              <p>
                Our permanent recruitment process is built around a single principle: only
                present candidates we would genuinely hire ourselves. That means thorough
                briefing before we start, proactive headhunting alongside active sourcing,
                and competency-based screening that goes well beyond reading a résumé.
              </p>
              <p>
                We work across mid-to-senior level permanent roles in IT &amp;
                Telecommunications, Construction, and Healthcare. Our consultants have
                sector-specific experience — they&apos;ve worked in or deeply around the
                industries they recruit for, which means they understand the difference
                between a candidate who looks right on paper and one who will actually thrive.
              </p>
            </div>

            <h2 className="mt-10 text-xl font-semibold">What&apos;s included</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Detailed role brief and market mapping discussion",
                "Proactive headhunting via our professional network",
                "Multi-channel sourcing (network, referrals, advertised)",
                "Competency-based phone and video screening",
                "Structured reference checking (2+ referees minimum)",
                "Interview coordination and candidate preparation",
                "Offer negotiation and counteroffer management",
                "30-, 60-, and 90-day post-placement check-ins",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-xl font-semibold">Typical timelines</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-6 text-left font-medium text-muted-foreground">Milestone</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Typical timeframe</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Initial shortlist presented", "5–10 business days from confirmed brief"],
                    ["Client interviews conducted", "Week 2–3"],
                    ["Offer made and accepted", "Week 3–5"],
                    ["Candidate start date", "2–4 weeks post-acceptance (notice dependent)"],
                  ].map(([milestone, timeframe]) => (
                    <tr key={milestone} className="border-b border-border/50">
                      <td className="py-3 pr-6 font-medium">{milestone}</td>
                      <td className="py-3 text-muted-foreground">{timeframe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 rounded-xl bg-muted/50 p-6">
              <h2 className="font-semibold">Outcome example</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A federal government health agency needed a Senior Project Manager with
                PRINCE2 certification and NV1 clearance — a combination that rules out
                most of the active candidate market. Within eight business days we
                identified, screened, and presented three candidates meeting every
                criterion. The successful candidate was made an offer in week three and
                started two weeks later. The agency reported that the same search had
                previously taken four months through a different agency.
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

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold">Ready to start?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Register your vacancy and a consultant will be in touch within one
                business day.
              </p>
              <Link
                href="/employers/register-vacancy"
                className={buttonVariants({ className: "mt-4 w-full" })}
              >
                Register a Vacancy
              </Link>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Prefer to talk first?{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    Get in touch
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inline form */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-semibold">Register a Vacancy</h2>
          <p className="mt-2 text-muted-foreground">Tell us about the role you need to fill.</p>
          <div className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
            <VacancyForm serviceType="Permanent" />
          </div>
        </div>
      </div>
    </>
  );
}
