import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Data Analytics",
  description:
    "Specialist Data Analytics recruitment for data analysts, data engineers, BI developers, and data scientists across Australia.",
  alternates: { canonical: "/industries/data-analytics" },
};

const OVERVIEW = [
  "Every organisation now says it is data-driven, but far fewer have the people to make that true. Across government, financial services, retail, and resources, demand for analysts and engineers who can turn messy operational data into trusted reporting has outpaced supply — and the gap widens every time a new AI initiative discovers its data isn't ready.",
  "The roles in highest demand sit at the intersection of statistics, engineering, and business communication: analysts who can translate a vague business question into a measurable answer, and data engineers who build the pipelines and models that keep dashboards and machine learning fed with clean, reliable data.",
  "Illoura's Data Analytics practice places candidates across the full analytics lifecycle — data engineering, analytics engineering, BI and reporting, data science, and data leadership. We assess technical depth properly: not keyword-matching a CV, but understanding whether a candidate has actually built and maintained something people rely on.",
  "For candidates: the market rewards specificity. A candidate who can clearly articulate the business decision their analysis changed will out-compete one with a longer tool list but no outcome story. We help you find that story and put it in front of the right hiring managers.",
];

const ROLES = [
  "Data Analyst", "Senior Data Analyst", "BI Developer",
  "BI Analyst", "Analytics Engineer", "Data Engineer",
  "Senior Data Engineer", "Data Scientist", "Data Architect",
  "Data Governance Lead", "Reporting Analyst", "Head of Data / Analytics",
];

export default async function DataAnalyticsPage() {
  const jobs = await getJobsByIndustry("Data Analytics");
  return (
    <IndustrySectorPage
      slug="data-analytics"
      name="Data Analytics"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
