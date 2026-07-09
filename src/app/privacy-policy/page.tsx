import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Illora's privacy policy — how we collect, store, and use your personal information.",
};

const SECTIONS = [
  {
    title: "1. About this policy",
    content: `This Privacy Policy explains how Illora Services Pty Ltd (ABN: [to be inserted]) ('Illora', 'we', 'us', 'our') collects, holds, uses, and discloses personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).

By using our website or engaging our services, you consent to the collection and use of your information as described in this policy. This policy was last updated in June 2026 and should be reviewed alongside any solicitor-drafted addendum before reliance in a commercial or regulatory context.`,
  },
  {
    title: "2. What information we collect",
    content: `We collect personal information necessary to provide recruitment services. This includes:

Candidate information: full name, contact details (email, phone, address), résumé and cover letter, employment history, qualifications, references, LinkedIn profile URL, and any other information you choose to provide.

Employer information: company name, contact name, role, email, phone, and information about roles you engage us to fill.

Website visitors: we collect standard server logs (IP address, browser type, pages visited) for security and operational purposes.`,
  },
  {
    title: "3. How we use your information",
    content: `We use personal information to:

— Assess your suitability for roles and present your profile to prospective employers (with your consent)
— Manage the recruitment process on behalf of employers
— Communicate with you about roles, interviews, and placement outcomes
— Send you marketing communications (market updates, hiring insights, Knowledge Hub content) — only where you have expressly opted in, and you may unsubscribe at any time
— Comply with our legal obligations

Transactional messages (for example, confirmation that we received your CV or enquiry) are part of providing our service and are sent regardless of marketing preferences.`,
  },
  {
    title: "4. Disclosure to third parties",
    content: `We may share your information with:

Prospective employers: we share candidate information only with your explicit consent for each role or employer.

Sub-processors: we use the following services which may process your data — JobAdder Pty Ltd (ATS), Supabase Inc / Neon Technologies (database), Cloudflare Inc (file storage via R2), Resend Inc (email delivery). Each provider is bound by data processing agreements.

Legal requirements: we will disclose information if required by law, court order, or regulatory authority.

We do not sell personal information to third parties.`,
  },
  {
    title: "5. Data retention",
    content: `Candidate information is retained for a maximum of three years from the date of last contact, after which it is securely deleted unless you request earlier removal. Employer contact information is retained for the duration of our business relationship.`,
  },
  {
    title: "6. Marketing communications",
    content: `We only send marketing emails (such as role alerts, hiring insights, and news) to people who have expressly opted in — for example, by ticking the marketing consent box when submitting a CV, registering a vacancy, or contacting us. We rely on your consent, or an existing business relationship where permitted, as the basis for sending in accordance with the Spam Act 2003 (Cth).

Every marketing email includes a working unsubscribe link, and unsubscribing takes effect immediately. Transactional messages relating to a service you have requested are not marketing and are handled separately. We do not add people to marketing lists without a lawful basis, and we do not sell or rent our mailing lists.`,
  },
  {
    title: "7. Your rights",
    content: `Under the Privacy Act, you have the right to:

— Access the personal information we hold about you
— Request correction of inaccurate or outdated information
— Request deletion of your information (subject to our legal obligations)
— Opt out of marketing communications at any time

To exercise any of these rights, contact us at privacy@illora.com.au.`,
  },
  {
    title: "8. Security",
    content: `We take reasonable steps to protect personal information from misuse, loss, and unauthorised access. Résumés and documents are stored in Cloudflare R2 with access controls. Database access is restricted to authorised personnel and encrypted in transit and at rest.`,
  },
  {
    title: "9. Complaints",
    content: `If you have a complaint about how we have handled your personal information, please contact us at privacy@illora.com.au. We will respond within 30 days. If you are not satisfied with our response, you may contact the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au.`,
  },
  {
    title: "10. Contact",
    content: `For privacy enquiries: privacy@illora.com.au
Illora Services Pty Ltd
Level 12, 20 Martin Place, Sydney NSW 2000

Note: This policy requires review by a qualified solicitor before it is relied upon for compliance purposes. It is provided here as a structural placeholder reflecting our intended data practices.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", href: "/privacy-policy" },
        ]}
      />
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
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
