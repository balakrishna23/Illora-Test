import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Illora's terms of service for website visitors and users of our recruitment services.",
  alternates: { canonical: "/terms-of-service" },
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    content: `By accessing or using the Illora website (illouraservices.com) or our recruitment services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.

Note: These terms should be reviewed and finalised by a qualified solicitor before they are relied upon commercially. They are provided here as a structural placeholder.`,
  },
  {
    title: "2. Services",
    content: `Illora provides recruitment and labour hire services to employers and career support services to candidates. The specific terms of any recruitment engagement are set out in a separate Service Agreement or Candidate Registration Agreement provided to you directly.`,
  },
  {
    title: "3. Use of website",
    content: `You agree to use the Illora website only for lawful purposes and in a manner consistent with these terms. You must not:

— Use the website in any way that is unlawful or fraudulent
— Transmit unsolicited commercial communications
— Attempt to gain unauthorised access to our systems
— Use automated tools to scrape or copy content from the website`,
  },
  {
    title: "4. Intellectual property",
    content: `All content on the Illora website — including text, logos, design, and other materials — is owned by or licensed to Illora Services Pty Ltd and is protected by Australian copyright law. You may not reproduce, distribute, or create derivative works from this content without our written permission.`,
  },
  {
    title: "5. Candidate terms",
    content: `By submitting your résumé or registering with Illora:

— You confirm that all information provided is accurate and up to date
— You authorise Illora to present your details to prospective employers, subject to your consent for each opportunity
— You understand that Illora does not guarantee employment outcomes
— You agree to inform us promptly if you accept employment through another channel while we are actively representing you`,
  },
  {
    title: "6. Employer terms",
    content: `By engaging Illora's recruitment services:

— You agree to provide accurate and complete information about roles and organisational requirements
— You agree not to engage candidates we introduce to you outside of the terms of our Service Agreement for a period of 12 months from introduction
— You understand that candidate shortlists represent Illora's professional recommendation but final hiring decisions remain solely your responsibility`,
  },
  {
    title: "7. Limitation of liability",
    content: `To the extent permitted by law, Illora's liability for any claim arising from use of our website or services is limited to the fees paid to Illora in the three months preceding the claim. We are not liable for indirect, consequential, or speculative losses.`,
  },
  {
    title: "8. Governing law",
    content: `These terms are governed by the laws of New South Wales, Australia. Any disputes arising under these terms are subject to the exclusive jurisdiction of the courts of New South Wales.`,
  },
  {
    title: "9. Changes to terms",
    content: `We may update these Terms of Service from time to time. We will notify you of material changes by posting an updated version on this page with a revised effective date. Your continued use of the website after changes are posted constitutes your acceptance of the updated terms.`,
  },
  {
    title: "10. Contact",
    content: `For questions about these terms: legal@illouraservices.com
Illora Services Pty Ltd
Level 12, 20 Martin Place, Sydney NSW 2000`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Terms of Service", href: "/terms-of-service" },
        ]}
      />
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective date: June 2026</p>
      </div>
      <Separator className="my-8" />
      <div className="space-y-10">
        {SECTIONS.map(({ title, content }) => (
          <div key={title}>
            <h2 className="font-semibold text-lg">{title}</h2>
            <div className="mt-3 space-y-3">
              {content.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
