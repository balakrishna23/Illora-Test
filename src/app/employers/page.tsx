import type { Metadata } from "next";
import Link from "next/link";
import {
  UserCheckIcon, FileTextIcon, BuildingIcon,
  PhoneCallIcon, SearchIcon, CalendarIcon, GiftIcon, ArrowRightIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { VacancyForm } from "@/features/employers/components/VacancyForm";
import { INDUSTRIES } from "@/lib/industries";

export const metadata: Metadata = {
  title: "For Employers",
  description:
    "Permanent, contract, and embedded RPO recruitment for AI Engineering, Cyber Security, and Data Analytics roles.",
  alternates: { canonical: "/employers" },
};

const SERVICES = [
  {
    href: "/employers/permanent",
    icon: UserCheckIcon,
    title: "Permanent Recruitment",
    description:
      "End-to-end sourcing, screening, and placement for full-time roles. We manage the entire process from brief to offer acceptance, so you can focus on running your business.",
    includes: [
      "Role brief and market mapping",
      "Proactive headhunting and network sourcing",
      "Competency-based screening and reference checks",
      "Interview coordination and offer negotiation",
      "90-day post-placement support",
    ],
  },
  {
    href: "/employers/contract",
    icon: FileTextIcon,
    title: "IT Contract Recruitment",
    description:
      "Specialist contractors for project delivery, peak demand, and capability gaps. Employer-of-record option with payroll and compliance handled for you.",
    includes: [
      "Rapid mobilisation for urgent requirements",
      "Employer-of-record option with payroll handled",
      "Security clearance verification",
      "Contractor performance monitoring",
      "Seamless conversion to permanent where required",
    ],
  },
  {
    href: "/employers/embedded-rpo",
    icon: BuildingIcon,
    title: "Embedded / RPO",
    description:
      "A dedicated Illoura recruiter embedded within your business for high-volume or ongoing hiring. You get specialist expertise without the overhead of an internal team.",
    includes: [
      "Dedicated on-site or virtual recruiter",
      "Full employer-brand alignment",
      "Reporting and pipeline analytics",
      "Scalable capacity up/down as hiring volumes change",
      "Suitable for 5+ hires per year",
    ],
  },
];

const PROCESS = [
  { icon: PhoneCallIcon, step: "01", title: "Discovery call", description: "We learn about your business, the role, and what a great outcome looks like." },
  { icon: SearchIcon, step: "02", title: "Sourcing & shortlisting", description: "We activate our network, headhunt proactively, and screen every candidate against your brief." },
  { icon: CalendarIcon, step: "03", title: "Interview coordination", description: "We manage scheduling, candidate prep, and feedback loops so the process moves quickly." },
  { icon: GiftIcon, step: "04", title: "Offer & onboarding", description: "We support negotiation, manage counteroffers, and coordinate the first-day experience." },
  { icon: UserCheckIcon, step: "05", title: "Post-placement check-in", description: "We stay in contact at 30, 60, and 90 days to ensure the placement is working for both sides." },
];

export default function EmployersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "For Employers", href: "/employers" },
        ]}
      />

      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">For Employers</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Recruitment that works as hard as you do.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          We deliver permanent, contract, and embedded recruitment across AI
          Engineering, Cyber Security, and Data Analytics — with the same depth
          of expertise at every level of seniority.
        </p>
      </div>

      {/* Services */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {SERVICES.map(({ href, icon: Icon, title, description, includes }) => (
          <div key={href} className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
            <ul className="mt-4 space-y-1.5">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={href}
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-6 self-start" })}
            >
              Learn more <ArrowRightIcon className="ml-1 size-3.5" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>

      <Separator className="my-16" />

      {/* Process stepper */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">How we work</h2>
        <p className="mt-2 text-muted-foreground">From brief to placed — what to expect.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {PROCESS.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="flex flex-col items-start">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {step}
                </div>
              </div>
              <Icon className="mt-4 size-5 text-accent" aria-hidden="true" />
              <h3 className="mt-2 font-semibold text-sm">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-16" />

      {/* Industries we serve */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Industries we serve</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {INDUSTRIES.map(({ name, slug }) => (
            <Link
              key={slug}
              href={`/industries/${slug}`}
              className={buttonVariants({ variant: "secondary" })}
            >
              {name}
            </Link>
          ))}
        </div>
      </div>

      <Separator className="my-16" />

      {/* Vacancy form */}
      <div id="register-vacancy">
        <h2 className="text-2xl font-semibold tracking-tight">Register a Vacancy</h2>
        <p className="mt-2 text-muted-foreground">
          Tell us about the role. A consultant will respond within one business day.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
          <VacancyForm />
        </div>
      </div>
    </div>
  );
}
