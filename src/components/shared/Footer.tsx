import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { footerLinks } from "@/lib/navigation";
import { Separator } from "@/components/ui/separator";

const EMPLOYER_LINKS = [
  { label: "For Employers", href: "/employers" },
  { label: "Permanent Recruitment", href: "/employers/permanent" },
  { label: "Contract & Labour Hire", href: "/employers/contract" },
  { label: "Embedded / RPO", href: "/employers/embedded-rpo" },
  { label: "Register a Vacancy", href: "/employers/register-vacancy" },
];

const CANDIDATE_LINKS = [
  { label: "For Candidates", href: "/candidates" },
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Submit Your CV", href: "/candidates/submit-cv" },
  { label: "Career Advice", href: "/candidates/career-advice" },
];

const ABOUT_LINKS = [
  { label: "About Illora", href: "/about" },
  { label: "First Nations Partnership", href: "/about/first-nations-partnership" },
  { label: "Capability Statement", href: "/about/capability-statement" },
  { label: "Knowledge Hub", href: "/knowledge-hub" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
              Illora
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-50 leading-relaxed">
              First Nations-owned recruitment delivering real outcomes across IT, Construction, and Healthcare.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                { label: "LinkedIn", href: "https://www.linkedin.com/company/illora" },
                { label: "Facebook", href: "https://www.facebook.com/illoraservices" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Employers */}
          <nav aria-label="Footer — Employers">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Employers</p>
            <ul className="mt-4 space-y-2.5">
              {EMPLOYER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Candidates */}
          <nav aria-label="Footer — Candidates">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Candidates</p>
            <ul className="mt-4 space-y-2.5">
              {CANDIDATE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Footer — Company">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Company</p>
            <ul className="mt-4 space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Certifications */}
        <div className="mt-10 flex flex-wrap gap-3">
          {["Supply Nation Certified", "Black Business Finder"].map((cert) => (
            <span
              key={cert}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium"
            >
              {cert}
            </span>
          ))}
        </div>

        <Separator className="my-8" />

        <p className="max-w-3xl text-sm text-muted-foreground">
          Illora acknowledges the Traditional Owners of the lands on which we
          work and live, and pays respect to Elders past, present and emerging.
          We recognise that sovereignty was never ceded.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {year} Illora Services Pty Ltd. All rights reserved.
          </p>
          <nav aria-label="Footer — Legal" className="flex gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
