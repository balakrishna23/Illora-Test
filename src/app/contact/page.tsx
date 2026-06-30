import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
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
  telephone: "+61-2-9000-0000",
  email: "hello@illora.com.au",
  url: "https://illora.com.au",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Level 12, 20 Martin Place",
    addressLocality: "Sydney",
    addressRegion: "NSW",
    postalCode: "2000",
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.8672,
    longitude: 151.2089,
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
                  <a href="tel:+61290000000" className="text-sm text-muted-foreground hover:text-foreground">
                    +61 2 9000 0000
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:hello@illora.com.au" className="text-sm text-muted-foreground hover:text-foreground">
                    hello@illora.com.au
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-medium">Office</p>
                  <address className="not-italic text-sm text-muted-foreground">
                    Level 12, 20 Martin Place<br />
                    Sydney NSW 2000
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

            <Separator className="my-8" />

            {/* Map embed */}
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Illora office location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.6!2d151.2089!3d-33.8672!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUyJzAyLjEiUyAxNTHCsDEyJzMyLjAiRQ!5e0!3m2!1sen!2sau!4v1"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Map showing Illora office at 20 Martin Place, Sydney"
              />
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
