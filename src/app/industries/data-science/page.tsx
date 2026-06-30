import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Data Science",
  description:
    "Specialist Data Science recruitment for data scientists, ML engineers, and data engineers across Australia.",
};

const OVERVIEW = [
  "Demand for data and AI talent has outpaced almost every other technology discipline in Australia. Organisations across retail, financial services, government, and resources are racing to build forecasting, personalisation, and generative AI capability — and the pool of genuinely experienced data scientists and ML engineers hasn't kept pace.",
  "The roles in highest demand sit at the intersection of statistics, software engineering, and business communication: data scientists who can translate a vague business question into a measurable model, and data engineers who can build the pipelines that keep that model fed with clean, reliable data. Pure research-only candidates without production experience are finding the market tighter than those who can ship.",
  "Illora's Data Science practice places candidates across the full analytics lifecycle — data engineering, data science, machine learning engineering, analytics translation, and data leadership. We assess technical depth properly: not keyword-matching a CV, but understanding whether a candidate has actually built and maintained something in production.",
  "For candidates: the market rewards specificity. A candidate who can clearly articulate the business impact of a model they built will out-compete one with a longer tool list but no outcome story. We help you find that story and put it in front of the right hiring managers.",
];

const ROLES = [
  "Data Scientist", "Senior Data Scientist", "Machine Learning Engineer",
  "Data Engineer", "Senior Data Engineer", "Analytics Engineer",
  "BI Developer", "BI Analyst", "Data Analyst",
  "MLOps Engineer", "Data Architect", "Head of Data / Analytics",
];

export default async function DataSciencePage() {
  const jobs = await getJobsByIndustry("Data Science");
  return (
    <IndustrySectorPage
      slug="data-science"
      name="Data Science"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
