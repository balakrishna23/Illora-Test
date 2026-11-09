import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "AI Engineering",
  description:
    "Specialist AI Engineering recruitment for machine learning engineers, LLM and applied AI engineers, and MLOps specialists across Australia.",
  alternates: { canonical: "/industries/ai-engineering" },
};

const OVERVIEW = [
  "Generative AI has moved from experiment to roadmap item in almost every Australian organisation, and the bottleneck is no longer access to models — it is people who can build reliable systems around them. Engineers who can take an AI prototype into production, with evaluation, monitoring, and guardrails, are among the hardest technical hires in the market.",
  "We see the strongest demand in three areas: applied AI and LLM engineers who build retrieval, agent, and integration layers on top of foundation models; machine learning engineers who train, tune, and serve models at scale; and MLOps and platform engineers who make the whole lifecycle repeatable, observable, and secure.",
  "Government and regulated industries add their own requirements — responsible AI frameworks, data sovereignty, and security clearances all narrow the candidate pool. Illoura works with both cleared and uncleared candidates and is upfront with clients about realistic timelines for specialist and clearance-dependent AI roles.",
  "For candidates: shipped work beats certificates. We see the best outcomes for engineers who can walk through a system they built — how they evaluated it, what broke in production, and what they changed — rather than a list of frameworks they have tried.",
];

const ROLES = [
  "AI Engineer", "Applied AI / LLM Engineer", "Machine Learning Engineer",
  "Senior ML Engineer", "MLOps Engineer", "AI Platform Engineer",
  "Computer Vision Engineer", "NLP Engineer", "AI Solutions Architect",
  "AI Product Manager", "Responsible AI Lead", "Head of AI",
];

export default async function AiEngineeringPage() {
  const jobs = await getJobsByIndustry("AI Engineering");
  return (
    <IndustrySectorPage
      slug="ai-engineering"
      name="AI Engineering"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
