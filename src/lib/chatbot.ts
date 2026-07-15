export type ChatLink = { label: string; href: string };
export type ChatReply = { text: string; links?: ChatLink[] };
export type ChatQuickAction = { key: string; label: string };

export const BOT_NAME = "Jarrah";
export const BOT_SUBTITLE = "Illoura Services · Your Guide";

export const CHAT_QUICK_ACTIONS: ChatQuickAction[] = [
  { key: "jobs",        label: "Browse jobs" },
  { key: "submit-cv",  label: "Submit my CV" },
  { key: "hire",       label: "I want to hire" },
  { key: "visa",       label: "Visa & work rights" },
  { key: "contact",    label: "Contact us" },
  { key: "industries", label: "Our industries" },
];

const REPLIES: Record<string, ChatReply> = {
  jobs: {
    text: "Ripper! We've got live roles across seven specialist sectors — IT & Telecoms, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. Jump in and filter by location, type, or industry to find what fits you best.",
    links: [{ label: "Browse all jobs →", href: "/jobs" }],
  },
  "submit-cv": {
    text: "Good thinking! Even if the perfect role isn't live right now, submitting your CV means our consultants have you on their radar. When something right comes up, you'll be first in line — no need to keep checking back.",
    links: [{ label: "Submit your CV →", href: "/candidates/submit-cv" }],
  },
  hire: {
    text: "Brilliant — you've come to the right place! We offer permanent, contract, and embedded recruitment across our seven specialist sectors. Register a vacancy and one of our consultants will be in touch within one business day. No fuss.",
    links: [
      { label: "Register a vacancy →", href: "/employers/register-vacancy" },
      { label: "Our employer services →", href: "/employers" },
    ],
  },
  visa: {
    text: "Great question! We regularly work alongside registered migration agents for roles like the Skills in Demand (482) and Employer Nomination Scheme (186) visas — especially in Nursing & Aged Care and Construction. We're not a migration agency ourselves, but our team can absolutely point you in the right direction.",
    links: [
      { label: "Talk to our team →", href: "/contact" },
      { label: "Nursing & Aged Care roles →", href: "/industries/nursing-aged-care" },
    ],
  },
  contact: {
    text: "No worries — here's how to reach the team. They're a friendly bunch and will get back to you quick smart.",
    links: [
      { label: "📧 info@illouraservices.com", href: "mailto:info@illouraservices.com" },
      { label: "📞 +61 2 6196 6999", href: "tel:+61261966999" },
      { label: "Full contact page →", href: "/contact" },
    ],
  },
  industries: {
    text: "We've built deep specialist networks across seven sectors — IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. Each has a dedicated consultant who actually knows the industry, not just the job title.",
    links: [{ label: "Explore our industries →", href: "/industries" }],
  },
  about: {
    text: "Illoura Services is a proud First Nations-owned recruitment business, Supply Nation Registered, and we've been connecting great people with great employers since 2018. We operate across all of Australia and put relationships before transactions — every time.",
    links: [{ label: "Learn more about us →", href: "/about" }],
  },
  salary: {
    text: "Salary ranges vary by role, sector, and experience — but our job listings always show the pay range where we're able to share it. Have a browse through live roles and filter by your industry. For a confidential yarn about market rates, our consultants are the best people to speak with.",
    links: [
      { label: "Browse jobs with salary info →", href: "/jobs" },
      { label: "Contact a consultant →", href: "/contact" },
    ],
  },
  location: {
    text: "We place candidates Australia-wide — Sydney, Melbourne, Brisbane, Perth, Canberra, Adelaide, Darwin, and remote locations too (especially for Nursing & Aged Care and Construction). Use the location filter on our jobs board to see what's near you.",
    links: [{ label: "Search jobs by location →", href: "/jobs" }],
  },
  remote: {
    text: "Yep, we've got remote and hybrid roles — especially in IT & Telecommunications, Data Science, and Cyber Security. Some healthcare and construction roles are site-based by nature. Filter by location on the jobs board and you'll see what's flexible.",
    links: [{ label: "Browse remote & hybrid roles →", href: "/jobs" }],
  },
  alert: {
    text: "Want to be first to know when a new role comes up? Flick us an email with the type of role you're after and your location — our team will match it to new listings and reach out personally. Much more reliable than a generic job alert!",
    links: [
      { label: "📧 Set up a job alert →", href: "mailto:info@illouraservices.com?subject=Job%20Alert%20Request" },
    ],
  },
  "first-nations": {
    text: "We're proud to be a First Nations-owned business, Supply Nation Registered, and genuinely committed to supporting Aboriginal and Torres Strait Islander candidates and employers. We walk the talk — this isn't just a tagline for us.",
    links: [{ label: "Our First Nations commitment →", href: "/about/first-nations-partnership" }],
  },
  "no-match": {
    text: "Ah, I'm sorry — we don't recruit in that space at the moment. But don't let that stop ya! Flick the team an email and they'll keep you in mind as Illoura grows into new sectors. Your details won't go to waste, I promise.",
    links: [
      { label: "📧 Email us to be notified →", href: "mailto:info@illouraservices.com?subject=Job%20Alert%20Request" },
      { label: "See what sectors we cover →", href: "/industries" },
    ],
  },
};

// Sectors we do NOT cover — triggers the "no-match" reply (only if no main keyword matched first)
const OUT_OF_SCOPE_KEYWORDS = [
  "teacher", "teaching", "education", "school", "lawyer", "legal", "solicitor",
  "accountant", "bookkeeping", "chef", "cook", "hospitality", "barista",
  "retail", "shop assistant", "real estate", "property agent", "mining",
  "agriculture", "farming", "truck driver", "logistics", "forklift",
];

const KEYWORD_RULES: { keywords: string[]; key: keyof typeof REPLIES }[] = [
  { keywords: ["job", "vacanc", "role", "position", "opening", "work available", "opportunit"], key: "jobs" },
  { keywords: ["cv", "resume", "résumé", "apply", "application", "upload my"], key: "submit-cv" },
  { keywords: ["hire", "employer", "recruit", "staff", "talent", "headhunt", "workforce"], key: "hire" },
  { keywords: ["visa", "sponsor", "migration", "work right", "482", "186", "skilled visa", "subclass"], key: "visa" },
  { keywords: ["contact", "email", "phone", "call", "linkedin", "reach", "talk", "speak to"], key: "contact" },
  {
    keywords: [
      "industr", "sector", "construction", "healthcare", "telecommunication", "it jobs",
      "nursing", "aged care", "data science", "machine learning", "cyber", "security",
      "ev waste", "recycling", "battery", "tech roles",
    ],
    key: "industries",
  },
  { keywords: ["about", "who are you", "company", "history", "when did you"], key: "about" },
  { keywords: ["salary", "pay", "wage", "rate", "how much", "income", "remuneration"], key: "salary" },
  { keywords: ["sydney", "melbourne", "brisbane", "perth", "canberra", "adelaide", "darwin", "where", "location", "city"], key: "location" },
  { keywords: ["remote", "work from home", "wfh", "hybrid", "flexible work"], key: "remote" },
  { keywords: ["alert", "notify", "remind", "let me know", "new role", "when.*role", "future role"], key: "alert" },
  { keywords: ["first nation", "indigenous", "aboriginal", "torres strait", "supply nation", "naidoc", "reconcil"], key: "first-nations" },
];

const FALLBACK_REPLY: ChatReply = {
  text: "Hmm, not sure I caught that one! I can help you find jobs, submit your CV, hire great talent, sort out visa questions, or just point you to the right page. Try one of the quick options below, or rephrase your question — no worries if it takes a couple of goes!",
};

export function matchReply(input: string): ChatReply {
  const lower = input.toLowerCase();

  // Match main keywords first
  for (const { keywords, key } of KEYWORD_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return REPLIES[key];
    }
  }

  // Only flag out-of-scope if no relevant keyword matched
  if (OUT_OF_SCOPE_KEYWORDS.some((kw) => lower.includes(kw))) {
    return REPLIES["no-match"];
  }

  return FALLBACK_REPLY;
}

export function getReplyByKey(key: string): ChatReply {
  return REPLIES[key] ?? FALLBACK_REPLY;
}
