import type { Metadata } from "next";
import { DownloadIcon, FileTextIcon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { CapabilityEmailForm } from "@/features/about/components/CapabilityEmailForm";

export const metadata: Metadata = {
  title: "Capability Statement",
  description:
    "Download Illoura's capability statement — covering our service offering, accreditations, and sector expertise.",
  alternates: { canonical: "/about/capability-statement" },
};

export default function CapabilityStatementPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Capability Statement", href: "/about/capability-statement" },
        ]}
      />

      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Capability Statement
        </h1>
        <p className="mt-3 text-muted-foreground">
          Our capability statement covers Illoura&apos;s service offering,
          accreditations, sector expertise, team overview, and example
          placements. It&apos;s designed for use in government and corporate
          procurement submissions.
        </p>
      </div>

      {/* PDF preview placeholder */}
      <div className="mt-8 rounded-xl border border-border bg-muted/40 flex flex-col items-center justify-center gap-4 py-16">
        <FileTextIcon className="size-16 text-muted-foreground/40" aria-hidden="true" />
        <div className="text-center">
          <p className="font-medium">Illoura Capability Statement</p>
          <p className="text-sm text-muted-foreground mt-1">PDF · 12 pages · Updated June 2026</p>
        </div>
        <a
          href="/capability-statement-illoura.pdf"
          download
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <DownloadIcon className="size-4" aria-hidden="true" />
          Download PDF
        </a>
      </div>

      <Separator className="my-12" />

      {/* Email gate option */}
      <div>
        <h2 className="text-xl font-semibold">Receive it by email</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Enter your details and we&apos;ll send you the capability statement
          directly. We may follow up once to see if there&apos;s anything else
          we can help with.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <CapabilityEmailForm />
        </div>
      </div>

      <Separator className="my-12" />

      {/* What's covered */}
      <div>
        <h2 className="text-xl font-semibold">What&apos;s covered</h2>
        <ul className="mt-4 space-y-3">
          {[
            "Company overview and founding story",
            "Supply Nation registration and other credentials",
            "Service offering: permanent, contract, and embedded RPO",
            "Sector expertise across AI Engineering, Cyber Security, and Data Analytics",
            "Leadership team profiles",
            "Example placements and client outcomes",
            "Pricing model overview",
            "Contact details and next steps",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
