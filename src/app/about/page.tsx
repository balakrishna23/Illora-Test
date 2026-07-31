import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getTeam } from "@/features/about/queries";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Illora's founding story, leadership team, and the values that guide how we recruit.",
};

const VALUES = [
  {
    name: "Integrity",
    description: "We say what we mean and do what we say. No candidate is oversold to a client, and no role is misrepresented to a candidate.",
  },
  {
    name: "Accountability",
    description: "We own our outcomes. If a placement isn't working, we respond immediately rather than wait for the relationship to deteriorate.",
  },
  {
    name: "Respect",
    description: "Every candidate who speaks with us receives a response. Every employer enquiry is treated as if the mandate has already been won.",
  },
  {
    name: "Responsiveness",
    description: "In recruitment, speed matters. We commit to responding to employer briefs within one business day and to candidate applications within two.",
  },
  {
    name: "Partnership",
    description: "Our best client relationships are long-term. We invest in understanding your business deeply enough to anticipate hiring needs before they become urgent.",
  },
  {
    name: "Impact",
    description: "We measure success not just by placements but by the economic opportunities we create — for individuals, families, and communities.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Illora",
  foundingDate: "2018",
  description: "First Nations-owned recruitment partner delivering real outcomes across seven specialist sectors, including IT & Telecommunications, Construction, and Healthcare.",
  founder: {
    "@type": "Person",
    name: "Lane McEwan",
    jobTitle: "Founder & Managing Director",
  },
};

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />

        {/* Founding story */}
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Our Story
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built on trust. Measured by outcomes.
            </h1>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Illora was founded in 2018 by Lane McEwan — a proud Wiradjuri
                and Ngiyampaa Wayilwan man with more than a decade of
                recruitment experience across IT, construction, and healthcare.
                Lane established Illora because he saw a market with no shortage
                of recruiters and a persistent shortage of genuine expertise,
                accountability, and follow-through.
              </p>
              <p>
                The business was built around a simple conviction: that
                recruitment done properly creates meaningful economic
                opportunity — for the individual who gets the right role, for
                the business that gets the right person, and for the communities
                those individuals belong to. That conviction shapes every
                decision we make.
              </p>
              <p>
                Since 2018, Illora has placed over 1,200 candidates, partnered
                with more than 80 employers across Australia, and maintained a
                94% client retention rate. We are Supply Nation Registered
                and listed on the Black Business Finder — credentials
                that reflect who we are, not just what we do.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-muted/50 p-8 flex flex-col justify-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              At a glance
            </p>
            <dl className="mt-6 space-y-4">
              {[
                ["Founded", "2018"],
                ["Headquarters", "Sydney, NSW (operates nationally)"],
                ["Sectors", "7 specialist sectors, Australia-wide"],
                ["Registrations", "Supply Nation Registered · Black Business Finder"],
                ["Candidates Placed", "1,200+"],
                ["Client Retention", "94%"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium text-right max-w-[55%]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Separator className="my-16" />

        {/* Leadership */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Leadership</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {team.map((member) => (
              <div key={member.name} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-primary font-medium mt-0.5">
                      {member.role}
                    </p>
                    {member.culturalConnection && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.culturalConnection}
                      </p>
                    )}
                  </div>
                  {member.linkedIn && (
                    <a
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLinkIcon className="size-4" />
                    </a>
                  )}
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        {/* Values */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Our Values</h2>
          <p className="mt-2 text-muted-foreground">
            Six principles that show up in every placement, every conversation.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ name, description }) => (
              <div key={name} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-2 inline-block rounded-md bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  {name}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary p-10 text-center text-primary-foreground">
          <h2 className="text-2xl font-semibold">Talk with our team</h2>
          <p className="mt-2 text-primary-foreground/70">
            Whether you&apos;re hiring or looking, we&apos;d love to hear from you.
          </p>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "accent", size: "lg", className: "mt-6" })}
          >
            Get in touch
          </Link>
        </div>
      </div>
    </>
  );
}
