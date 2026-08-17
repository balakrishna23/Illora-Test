import Link from "next/link";
import { PhoneIcon, MailIcon, MapPinIcon, ExternalLinkIcon } from "lucide-react";

import { IllouraLogo } from "@/components/shared/IllouraLogo";
import { DotDivider } from "@/components/shared/DotDivider";
import { footerLinks } from "@/lib/navigation";
import { Separator } from "@/components/ui/separator";

const MAIN_MENU = [
  { label: "For Employers", href: "/employers" },
  { label: "For Candidates", href: "/candidates" },
  { label: "Jobs", href: "/jobs" },
  { label: "Industries", href: "/industries" },
  { label: "About Us", href: "/about" },
  { label: "Knowledge Hub", href: "/knowledge-hub" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-of-service" },
];

const SERVICES = [
  { label: "Permanent Recruitment", href: "/employers/permanent" },
  { label: "Contract & Labour Hire", href: "/employers/contract" },
  { label: "Embedded / RPO", href: "/employers/embedded-rpo" },
  { label: "Register a Vacancy", href: "/employers/register-vacancy" },
  { label: "Submit Your CV", href: "/candidates/submit-cv" },
  { label: "Career Advice", href: "/candidates/career-advice" },
];

const INDUSTRIES = [
  { label: "IT & Telecommunications", href: "/industries/it-telecommunications" },
  { label: "Construction", href: "/industries/construction" },
  { label: "Healthcare", href: "/industries/healthcare" },
  { label: "Nursing & Aged Care", href: "/industries/nursing-aged-care" },
  { label: "Data Science", href: "/industries/data-science" },
  { label: "Cyber Security", href: "/industries/cyber-security" },
  { label: "EV Waste & Recycling", href: "/industries/ev-waste" },
];

const OFFICES = [
  "30 Applebox Avenue, Glenwood NSW 2768",
  "2 Janine Haines Terrace, Coombs ACT 2611",
  "11 Celestial Circuit, Tarneit VIC 3029",
];

const SOCIALS = [
  { label: "Facebook", short: "f", href: "https://www.facebook.com/illouraservices" },
  { label: "LinkedIn", short: "in", href: "https://www.linkedin.com/company/illouraservices" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/20">
      {/* Aboriginal flag–inspired earth stripe: charcoal | terracotta | golden ochre */}
      <div className="flex h-0.75" aria-hidden="true">
        <div className="flex-1" style={{ background: "oklch(0.17 0.04 30)" }} />
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-accent" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">

        {/* 4-column grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.9fr_1fr_1.3fr_1.4fr]">

          {/* ── Brand + Acknowledgement ── */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <IllouraLogo className="h-12 w-12 shrink-0" />
              <span className="text-base font-semibold tracking-tight text-foreground">
                Illoura Services
              </span>
            </Link>

            <div className="mt-5 border-l-2 border-accent/60 pl-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Illoura Services acknowledges all Aboriginal and Torres Strait Islander
                Traditional Custodians of the lands on which we work and live.
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We pay our respect to their Elders – past and present – and recognise their
                continuing connection to land, sea, culture and community.
              </p>
            </div>

            {/* Supply Nation badge */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <span className="text-[10px] font-extrabold text-primary">SN</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary leading-tight">Supply Nation</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  Registered Indigenous Service Provider
                </p>
              </div>
            </div>

            {/* Social icons */}
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, short, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold transition-opacity hover:opacity-75"
                >
                  {short}
                </a>
              ))}
            </div>
          </div>

          {/* ── Main Menu ── */}
          <nav aria-label="Footer — Main Menu">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Main Menu</p>
            <ul className="mt-4 space-y-2.5">
              {MAIN_MENU.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Services + Industries ── */}
          <div>
            <nav aria-label="Footer — Services">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Services</p>
              <ul className="mt-4 space-y-2.5">
                {SERVICES.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Footer — Industries" className="mt-7">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Industries</p>
              <ul className="mt-4 space-y-2.5">
                {INDUSTRIES.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Contact + Offices ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Contact</p>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="tel:+61261966999"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <PhoneIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  +61 2 6196 6999
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@illouraservices.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary break-all"
                >
                  <MailIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  info@illouraservices.com
                </a>
              </li>
            </ul>

            <p className="mt-7 text-xs font-bold uppercase tracking-widest text-primary">Address</p>
            <ul className="mt-4 space-y-3">
              {OFFICES.map((addr) => (
                <li key={addr} className="flex gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{addr}</span>
                </li>
              ))}
            </ul>

            {/* Black Business Finder */}
            <a
              href="https://www.blackbusinessfinder.com.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Black Business Finder
              <ExternalLinkIcon className="size-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        <DotDivider className="my-8" count={41} />
        <Separator className="mb-8" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {year} Illoura Services Pty Ltd. All rights reserved.
          </p>
          <nav aria-label="Footer — Legal" className="flex gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
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
