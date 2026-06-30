import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "IT & Telecommunications",
  description:
    "Specialist IT & Telecommunications recruitment across network engineering, DevOps, cybersecurity, and digital health for enterprise, government, and high-growth organisations.",
};

const OVERVIEW = [
  "Australia's IT and telecommunications sector entered 2026 with a structural talent shortfall exceeding 60,000 workers — concentrated in cloud infrastructure, cybersecurity, and AI/ML engineering. For employers, this means competing for a candidate pool that has more options than at any point in the past decade. For candidates, it means that positioning and presentation matter more than simply being available.",
  "Illora has been recruiting in IT and telecommunications since our founding. Our consultants understand the difference between a candidate who can perform in an enterprise Cisco environment and one better suited to a fast-moving cloud-native team — a distinction that only comes from genuine sector knowledge, not keyword matching.",
  "We place professionals across the full career spectrum, from mid-level engineers to CTO-level executives, in permanent, contract, and embedded arrangements. Our client base spans the federal government, state agencies, major telcos, managed service providers, healthcare IT organisations, and high-growth technology companies.",
  "For candidates: whether you're a senior network engineer with two decades of experience or a DevOps engineer moving from a startup to enterprise, we'll give you an honest read on the market and put you in front of the right conversations.",
];

const ROLES = [
  "Network Engineer", "Senior Network Engineer", "Network Architect",
  "DevOps Engineer", "Cloud Engineer", "Solutions Architect",
  "Cybersecurity Analyst", "Security Engineer", "CISO",
  "Project Manager — IT", "Program Manager", "Scrum Master",
  "Systems Administrator", "Infrastructure Engineer", "Service Desk Manager",
  "Data Engineer", "BI Developer", "CTO / CIO",
];

export default async function ItTelecommunicationsPage() {
  const jobs = await getJobsByIndustry("IT & Telecommunications");
  return (
    <IndustrySectorPage
      slug="it-telecommunications"
      name="IT & Telecommunications"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
