import { SITE_URL } from "@/lib/site";

// Single source of truth for the Organization JSON-LD emitted on multiple
// pages (home, about, and reused by jobPosting.hiringOrganization). Previously
// duplicated with drifting fields/name spelling across pages — keep it here
// so every page describes the same entity the same way.
export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Illoura",
  description:
    "First Nations-owned recruitment delivering real outcomes across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling.",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  foundingDate: "2024",
  founder: {
    "@type": "Person",
    name: "Lane McEwan",
    jobTitle: "Founder & Managing Director",
  },
  sameAs: [
    "https://www.facebook.com/illouraservices",
    "https://www.linkedin.com/company/illouraservices",
  ],
} as const;
