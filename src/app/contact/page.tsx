import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Illora team — employer, candidate, general, or media enquiries.",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Illora",
  description: "First Nations-owned recruitment across seven specialist sectors including IT & Telecommunications, Construction, and Healthcare.",
  telephone: "+61-2-6196-6999",
  email: "info@illouraservices.com",
  url: "https://illouraservices.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "30 Applebox Avenue",
    addressLocality: "Glenwood",
    addressRegion: "NSW",
    postalCode: "2768",
    addressCountry: "AU",
  },
  openingHours: ["Mo-Fr 08:30-17:30"],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(localBusinessJsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Contact", href: "/contact" },
          ]}
        />

        <div className="mt-8 grid gap-12 lg:grid-cols-5">
          {/* Contact info */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-semibold tracking-tight">Get in touch</h1>
            <p className="mt-3 text-muted-foreground">
              Whether you&apos;re hiring, looking for work, or have a general
              enquiry — we respond to every message within one business day.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+61261966999" className="text-sm text-muted-foreground hover:text-foreground">
                    +61 2 6196 6999
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@illouraservices.com" className="text-sm text-muted-foreground hover:text-foreground">
                    info@illouraservices.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-medium">Offices</p>
                  <address className="not-italic text-sm text-muted-foreground space-y-2">
                    <span className="block">30 Applebox Avenue, Glenwood NSW 2768</span>
                    <span className="block">2 Janine Haines Terrace, Coombs ACT 2611</span>
                    <span className="block">11 Celestial Circuit, Tarneit VIC 3029</span>
                  </address>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-medium">Office hours</p>
                  <p className="text-sm text-muted-foreground">
                    Monday – Friday, 8:30 am – 5:30 pm AEST
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Send us a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a subject to ensure your message reaches the right person.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
