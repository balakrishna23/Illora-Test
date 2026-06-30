import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Cyber Security",
  description:
    "Specialist Cyber Security recruitment for SOC analysts, penetration testers, and security leaders across Australia.",
};

const OVERVIEW = [
  "Cyber security has moved from a back-office IT function to a board-level priority. Mandatory data breach reporting, the Security of Critical Infrastructure Act, and a sustained increase in ransomware activity have pushed demand for security talent well beyond supply, particularly for candidates holding government security clearances.",
  "We see the most acute shortages in three areas: SOC analysts capable of genuine triage (not just alert-forwarding), offensive security specialists (penetration testers and red teamers) with current certifications, and governance, risk and compliance (GRC) professionals who can translate technical risk into language a board will act on.",
  "Government and defence-adjacent roles add a further layer of complexity — clearance status (Baseline, NV1, NV2) materially narrows the available candidate pool, and clearance sponsorship timelines need to be factored into any hiring plan. Illora works with both cleared and uncleared candidate pools and is upfront with clients about realistic timelines for clearance-dependent roles.",
  "For candidates: certifications matter, but so does demonstrated hands-on experience. We see strong outcomes for candidates who can speak fluently about an actual incident they handled or a vulnerability they found, not just the certifications on their CV.",
];

const ROLES = [
  "SOC Analyst (L1/L2/L3)", "Incident Response Lead", "Threat Hunter",
  "Penetration Tester", "Red Team Lead", "Security Engineer",
  "Security Architect", "GRC Analyst", "IAM Specialist",
  "CISO", "Security Operations Manager", "DevSecOps Engineer",
];

export default async function CyberSecurityPage() {
  const jobs = await getJobsByIndustry("Cyber Security");
  return (
    <IndustrySectorPage
      slug="cyber-security"
      name="Cyber Security"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
