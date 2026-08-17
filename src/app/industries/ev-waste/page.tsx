import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "EV Waste & Recycling",
  description:
    "Specialist recruitment for Australia's battery and EV waste circular economy — technicians, compliance, and sustainability leaders.",
  alternates: { canonical: "/industries/ev-waste" },
};

const OVERVIEW = [
  "Australia's electric vehicle fleet is growing quickly, and with it, an entirely new industry: safely recovering, recycling, and repurposing end-of-life EV and grid-storage batteries. State and federal product stewardship schemes are tightening requirements on battery manufacturers and importers, and that regulatory pressure is translating directly into hiring demand for recovery facilities, recyclers, and compliance teams.",
  "This is a genuinely emerging sector, which means the talent pool is still forming. We're seeing strong demand for technicians with hazardous materials or electrical trade backgrounds who can be trained into safe battery dismantling and recovery, alongside more senior compliance and sustainability roles requiring EPA licensing and ISO 14001 experience.",
  "Illoura has built relationships with the operators leading this space in South Australia, Victoria, and New South Wales. We understand the safety-critical nature of these roles and screen candidates accordingly — this is not a sector where a CV alone tells the full story.",
  "For candidates with a trade, WHS, or environmental compliance background curious about a sector with genuine long-term growth, this is one of the more interesting emerging spaces in the Australian labour market right now.",
];

const ROLES = [
  "Battery Recycling Technician", "Resource Recovery Operator", "EV Battery Engineer",
  "Sustainability Manager", "Environmental Compliance Officer", "EHS Advisor",
  "Circular Economy Analyst", "Waste Operations Manager", "Hazardous Materials Specialist",
  "Plant Operator", "Logistics & Supply Chain Coordinator", "Site Manager — Recovery Facility",
];

export default async function EvWastePage() {
  const jobs = await getJobsByIndustry("EV Waste & Recycling");
  return (
    <IndustrySectorPage
      slug="ev-waste"
      name="EV Waste & Recycling"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
