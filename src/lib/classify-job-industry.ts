import type { JobIndustry } from "@/lib/job-constants";

// Title-based rules for sorting an externally sourced job into one of
// Illoura's specialisms. Checked in order, so a "Machine Learning Data
// Engineer" lands in AI Engineering rather than Data Analytics. Titles are
// used rather than descriptions because government ads mention "data" and
// "security" in almost every non-technical role's body text.
const RULES: { industry: JobIndustry; pattern: RegExp }[] = [
  {
    industry: "AI Engineering",
    pattern:
      /\b(ai|a\.i\.|artificial intelligence|machine learning|ml|mlops|llm|deep learning|computer vision|nlp|natural language processing|generative)\b/i,
  },
  {
    industry: "Cyber Security",
    pattern:
      /\b(cyber|infosec|information security|ict security|it security|security (engineer|analyst|architect|operations|specialist|consultant|advisor|adviser|manager|lead)|soc analyst|penetration|pen ?test(er|ing)?|threat|vulnerability|incident response|identity and access|iam|grc|ciso)\b/i,
  },
  {
    industry: "Data Analytics",
    pattern:
      /\b(data (analyst|engineer|scientist|architect|governance|modeller|modeler|warehouse|platform|lead|manager|specialist)|data science|analytics|business intelligence|bi (developer|analyst|engineer)|power bi|reporting analyst|insights analyst|statistician)\b/i,
  },
];

// Roles that match a keyword above but aren't technical, e.g. a security
// guard or a data entry clerk.
const EXCLUDE = /\b(guard|patrol|custodial|protective services|data entry|clerk|receptionist)\b/i;

export function classifyJobIndustry(title: string): JobIndustry | null {
  if (EXCLUDE.test(title)) return null;
  return RULES.find(({ pattern }) => pattern.test(title))?.industry ?? null;
}
