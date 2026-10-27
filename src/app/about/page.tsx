import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { ORGANIZATION_JSON_LD } from "@/lib/organization-schema";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getTeam } from "@/features/about/queries";
import { TeamMemberCard } from "@/features/about/components/TeamMemberCard";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Illoura's founding story, team, and the values that guide how we recruit.",
  alternates: { canonical: "/about" },
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


export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(ORGANIZATION_JSON_LD) }}
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
                Illoura was founded in 2024 by Lane McEwan, a proud Ngiyampaa
                Wayilwan and Wiradjuri man from Warren, NSW. Lane started
                Illoura with a vision to build a strong, sustainable
                Indigenous-owned business that delivers exceptional outcomes for
                clients while creating opportunities for people and communities.
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
                We are Supply Nation Registered
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
                ["Founded", "2024"],
                ["Headquarters", "Sydney, NSW (operates nationally)"],
                ["Sectors", "7 specialist sectors, Australia-wide"],
                ["Registrations", "Supply Nation Registered · Black Business Finder"],
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

        {/* Team */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Our Team</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {team.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
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
