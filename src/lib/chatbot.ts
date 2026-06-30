export type ChatLink = { label: string; href: string };

export type ChatReply = { text: string; links?: ChatLink[] };

export type ChatQuickAction = { key: string; label: string };

export const CHAT_QUICK_ACTIONS: ChatQuickAction[] = [
  { key: "jobs", label: "Browse jobs" },
  { key: "submit-cv", label: "Submit my CV" },
  { key: "hire", label: "I want to hire" },
  { key: "visa", label: "Visa & work rights" },
  { key: "contact", label: "Contact details" },
  { key: "industries", label: "Industries we serve" },
];

const REPLIES: Record<string, ChatReply> = {
  jobs: {
    text: "We currently have live roles across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. You can search and filter by location, type, and industry.",
    links: [{ label: "Browse all jobs", href: "/jobs" }],
  },
  "submit-cv": {
    text: "Don't see the right role yet? Submit your CV and a consultant will review it and reach out when a matching role comes up.",
    links: [{ label: "Submit your CV", href: "/candidates/submit-cv" }],
  },
  hire: {
    text: "We offer permanent, contract, and embedded recruitment across our seven specialist sectors. Register a vacancy and a consultant will respond within one business day.",
    links: [
      { label: "Register a vacancy", href: "/employers/register-vacancy" },
      { label: "Our services", href: "/employers" },
    ],
  },
  visa: {
    text: "Many candidates and employers we work with have questions about Australian work rights and visa sponsorship (for example the Skills in Demand visa, subclass 186 or 482). We're not a registered migration agency, but our consultants regularly work alongside registered migration agents, and we help employers understand sponsorship obligations for eligible roles. For anything specific to your situation, it's best to speak with our team directly.",
    links: [{ label: "Talk to our team", href: "/contact" }],
  },
  contact: {
    text: "Here's how to reach us directly:",
    links: [
      { label: "Email: hello@illora.com.au", href: "mailto:hello@illora.com.au" },
      { label: "Phone: +61 2 9000 0000", href: "tel:+61290000000" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/illora" },
      { label: "Full contact page", href: "/contact" },
    ],
  },
  industries: {
    text: "We specialise in seven sectors: IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling.",
    links: [{ label: "Explore industries", href: "/industries" }],
  },
  about: {
    text: "Illora is a First Nations-owned recruitment partner, Supply Nation certified, operating since 2018.",
    links: [{ label: "About Illora", href: "/about" }],
  },
};

const KEYWORD_RULES: { keywords: string[]; key: keyof typeof REPLIES }[] = [
  { keywords: ["job", "vacanc", "role", "position", "opening"], key: "jobs" },
  { keywords: ["cv", "resume", "résumé", "apply"], key: "submit-cv" },
  { keywords: ["hire", "employer", "recruit", "staff"], key: "hire" },
  { keywords: ["visa", "sponsor", "migration", "work right", "482", "186", "skilled"], key: "visa" },
  { keywords: ["contact", "email", "phone", "call", "linkedin", "reach"], key: "contact" },
  {
    keywords: [
      "industr", "sector", "construction", "healthcare", "telecommunication",
      "nursing", "aged care", "data science", "machine learning", "cyber",
      "security", "ev waste", "recycling", "battery",
    ],
    key: "industries",
  },
  { keywords: ["about", "who are you", "company", "first nations", "supply nation"], key: "about" },
];

const FALLBACK_REPLY: ChatReply = {
  text: "I can help with finding jobs, submitting your CV, hiring talent, visa and work rights questions, or connecting you with our team. Try one of the options below, or ask me something else.",
};

export function matchReply(input: string): ChatReply {
  const lower = input.toLowerCase();
  for (const { keywords, key } of KEYWORD_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return REPLIES[key];
    }
  }
  return FALLBACK_REPLY;
}

export function getReplyByKey(key: string): ChatReply {
  return REPLIES[key] ?? FALLBACK_REPLY;
}
