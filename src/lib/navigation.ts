export type NavLink = { label: string; href: string };
export type NavSubItem = { label: string; href: string; description?: string };
export type NavItem =
  | { label: string; href: string; items?: never }
  | { label: string; href?: never; items: NavSubItem[] };

export const NAV_ITEMS: NavItem[] = [
  {
    label: "For Employers",
    items: [
      { label: "Permanent Recruitment",  href: "/employers/permanent",          description: "Long-term talent for your team" },
      { label: "Contract & Labour Hire", href: "/employers/contract",            description: "Flexible workforce solutions" },
      { label: "Embedded / RPO",         href: "/employers/embedded-rpo",        description: "Recruitment as a service" },
      { label: "Register a Vacancy",     href: "/employers/register-vacancy",    description: "Post a role — we respond in 1 day" },
    ],
  },
  {
    label: "For Candidates",
    items: [
      { label: "Browse Jobs",    href: "/jobs",                      description: "Live roles Australia-wide" },
      { label: "Submit Your CV", href: "/candidates/submit-cv",      description: "Get on our radar" },
      { label: "Career Advice",  href: "/candidates/career-advice",  description: "Tips from our consultants" },
    ],
  },
  {
    label: "Industries",
    items: [
      { label: "IT & Telecommunications", href: "/industries/it-telecommunications" },
      { label: "Construction",            href: "/industries/construction" },
      { label: "Healthcare",              href: "/industries/healthcare" },
      { label: "Nursing & Aged Care",     href: "/industries/nursing-aged-care" },
      { label: "Data Science",            href: "/industries/data-science" },
      { label: "Cyber Security",          href: "/industries/cyber-security" },
      { label: "EV Waste & Recycling",    href: "/industries/ev-waste" },
    ],
  },
  { label: "Jobs",     href: "/jobs" },
  {
    label: "About",
    items: [
      { label: "About Illoura",             href: "/about",                           description: "Our story and mission" },
      { label: "First Nations Partnership", href: "/about/first-nations-partnership",  description: "Walking the talk" },
      { label: "Knowledge Hub",             href: "/knowledge-hub",                   description: "Insights & career advice" },
      { label: "Testimonials",              href: "/testimonials",                    description: "What our clients say" },
    ],
  },
  { label: "Contact",  href: "/contact" },
];

/** Kept for backwards compatibility with any existing imports */
export const primaryNavLinks: NavLink[] = NAV_ITEMS.map((item) =>
  item.href
    ? { label: item.label, href: item.href }
    : { label: item.label, href: `/${item.label.toLowerCase().replace(/\s+/g, "-")}` }
);

export const footerLinks: NavLink[] = [
  { label: "Privacy Policy",   href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];
