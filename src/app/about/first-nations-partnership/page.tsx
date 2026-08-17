import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheckIcon, ExternalLinkIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "First Nations Partnership",
  description:
    "Illora's First Nations partnership commitments, Supply Nation registration, and Indigenous procurement credentials.",
  alternates: { canonical: "/about/first-nations-partnership" },
};

const CERTIFICATIONS = [
  {
    name: "Supply Nation Registered",
    description:
      "Supply Nation is Australia's peak body for Indigenous business supplier diversity. As a Registered business, Illora is confirmed as at least 50% Aboriginal or Torres Strait Islander owned and listed in Supply Nation's directory of Indigenous businesses.",
    verifyText: "Verify on Supply Nation directory",
    verifyHref: "https://www.supplynation.org.au/search",
    renewalNote: "Registration current. Reviewed annually.",
  },
  {
    name: "Black Business Finder",
    description:
      "Illora is listed on the Black Business Finder — Australia's online marketplace and directory of Aboriginal and Torres Strait Islander businesses.",
    verifyText: "View on Black Business Finder",
    verifyHref: "https://blackbusinessfinder.com.au",
    renewalNote: "Listing current.",
  },
];

const COMMITMENTS = [
  {
    title: "Procurement policy",
    description:
      "Illora directs at least 20% of our own procurement spend to other Supply Nation certified or Indigenous-owned businesses, including professional services, technology, and operational suppliers.",
  },
  {
    title: "Community give-back",
    description:
      "A portion of Illora's annual profit is directed to community programs supporting Indigenous youth employment and vocational pathways. Recipients are disclosed in our annual impact report.",
  },
  {
    title: "Cultural protocols",
    description:
      "We follow Acknowledgement of Country protocols in all formal settings, including client meetings and proposals. Our team undertakes cultural awareness training annually.",
  },
  {
    title: "Economic participation",
    description:
      "We actively support government and corporate clients in meeting their Indigenous Procurement Policy (IPP) obligations and can provide registration documentation and assistance with procurement reporting.",
  },
];

export default function FirstNationsPartnershipPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "First Nations Partnership", href: "/about/first-nations-partnership" },
        ]}
      />

      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          First Nations Partnership
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Verifiable credentials. Real commitment.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          Illora is a First Nations-owned and operated business, founded by Lane
          McEwan — a proud Wiradjuri and Ngiyampaa Wayilwan man. Our
          First Nations identity isn&apos;t a procurement angle. It&apos;s who we are
          and why we exist.
        </p>
      </div>

      {/* Acknowledgement of Country */}
      <div className="mt-10 rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="font-semibold text-lg">Acknowledgement of Country</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Illora acknowledges the Traditional Owners of the lands on which we
          work and live across Australia. We pay our deepest respects to Elders
          past, present and emerging, and to the ongoing living cultures of
          Aboriginal and Torres Strait Islander peoples. We recognise that
          sovereignty was never ceded.
        </p>
      </div>

      <Separator className="my-12" />

      {/* Certifications */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Accreditations &amp; Registrations
        </h2>
        <p className="mt-2 text-muted-foreground">
          Every credential below is independently verifiable. We provide links
          directly — not because we need to, but because we believe proof matters
          more than promise.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {CERTIFICATIONS.map(({ name, description, verifyText, verifyHref, renewalNote }) => (
            <div key={name} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold">{name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{renewalNote}</p>
                  <a
                    href={verifyHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {verifyText}
                    <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-12" />

      {/* Commitments */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          What our commitment means in practice
        </h2>
        <p className="mt-2 text-muted-foreground">
          These are operational commitments — not positioning statements.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {COMMITMENTS.map(({ title, description }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-12" />

      {/* For procurement teams */}
      <div className="rounded-2xl bg-primary p-10 text-primary-foreground">
        <h2 className="text-2xl font-semibold">For procurement teams</h2>
        <p className="mt-3 max-w-2xl text-primary-foreground/70 leading-relaxed">
          If your organisation operates under the Commonwealth Indigenous
          Procurement Policy (IPP) or a state equivalent, we can provide our
          Supply Nation registration, ABN verification, and RENSW or other
          state registration documentation on request. We can also assist your
          team with reporting requirements.
        </p>
        <Link
          href="/contact"
          className={buttonVariants({ variant: "accent", size: "lg", className: "mt-6" })}
        >
          Request documentation
        </Link>
      </div>
    </div>
  );
}
