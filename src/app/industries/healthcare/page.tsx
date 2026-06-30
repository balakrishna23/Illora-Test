import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Healthcare",
  description:
    "Specialist healthcare recruitment for registered nurses, allied health professionals, and clinical leaders across aged care, acute, and community health settings.",
};

const OVERVIEW = [
  "Australia's healthcare workforce is under structural pressure from multiple directions simultaneously: an ageing population increasing demand for aged care and chronic disease management; post-Royal Commission reforms requiring higher staffing ratios in residential care; and a registered nurse pipeline that hasn't kept pace with either of these trends.",
  "The Aged Care Quality and Safety Commission's mandatory care minute requirements — 215 minutes of total care per resident per day — have materially increased nursing demand in the residential aged care sector. At the same time, acute and subacute settings face their own pressures, with hospital systems competing for the same clinical talent pool.",
  "For employers: the organisations succeeding in this environment are those that have invested in structured career pathways, genuine flexibility, and transparent workload communication from the interview stage. Candidates who have experienced the gap between 'what was described' and 'what the role actually is' are increasingly selective about where they consider.",
  "For candidates: the healthcare labour market remains candidate-favourable across most clinical disciplines. Salary growth has been consistent, and the quality of employers varies significantly. Illora's value is helping you access the employers who are genuine about their culture commitments, not just those with the best-written job advertisements.",
];

const ROLES = [
  "Registered Nurse", "Clinical Nurse Specialist", "Clinical Nurse Educator",
  "Nurse Unit Manager", "Director of Nursing", "Enrolled Nurse",
  "Physiotherapist", "Occupational Therapist", "Speech Pathologist",
  "Social Worker", "Dietitian", "Pharmacist",
  "Personal Care Worker", "Support Worker", "Care Coordinator",
  "GP Practice Manager", "Clinical Manager", "Healthcare Administrator",
];

export default async function HealthcarePage() {
  const jobs = await getJobsByIndustry("Healthcare");
  return (
    <IndustrySectorPage
      slug="healthcare"
      name="Healthcare"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
