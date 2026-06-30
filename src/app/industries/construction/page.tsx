import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Construction",
  description:
    "Specialist construction recruitment for site managers, estimators, schedulers, and WHS professionals across commercial, civil, and government infrastructure.",
};

const OVERVIEW = [
  "Australia's construction sector is in the middle of a sustained, pipeline-driven growth phase. The combination of federal and state infrastructure programs — road, rail, defence, social housing, and healthcare facilities — has created demand for skilled project delivery and trades professionals that won't ease materially before 2028.",
  "The roles most in demand are Site Managers with commercial and civil crossover, Estimators capable of pricing complex packages, and Schedulers experienced with Primavera P6 or similar. WHS Advisors with major project exposure are increasingly required by clients on projects above $20M, and demand for Project Engineers with EPC experience remains strong across the resources and defence sectors.",
  "Salary benchmarks in construction have run at 8–12% year-on-year growth since 2024. Candidates with a track record on Tier 1 or Tier 2 projects and demonstrated ability to operate under NEC or AS2124 contract frameworks are in the strongest negotiating position.",
  "Illora's construction recruitment team has genuine sector experience. We don't confuse a Site Manager role with a Project Manager role, and we don't present a civil-only background for a commercial construction brief. That precision matters to both sides of a placement.",
];

const ROLES = [
  "Site Manager", "Project Manager", "Construction Manager",
  "Estimator", "Senior Estimator", "Bid Manager",
  "Project Engineer", "Civil Engineer", "Structural Engineer",
  "Scheduler / Planner", "Project Controls", "Contract Administrator",
  "WHS Advisor", "WHS Manager", "Environmental Advisor",
  "Site Supervisor", "Foreman", "Leading Hand",
];

export default async function ConstructionPage() {
  const jobs = await getJobsByIndustry("Construction");
  return (
    <IndustrySectorPage
      slug="construction"
      name="Construction"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
