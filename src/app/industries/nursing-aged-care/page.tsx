import type { Metadata } from "next";

import { IndustrySectorPage } from "@/features/industries/components/IndustrySectorPage";
import { getJobsByIndustry } from "@/server/integrations/jobadder";

export const metadata: Metadata = {
  title: "Nursing & Aged Care",
  description:
    "Specialist nursing recruitment for residential aged care and rural and remote postings across Australia, with visa and migration support for international candidates.",
  alternates: { canonical: "/industries/nursing-aged-care" },
};

const OVERVIEW = [
  "Nursing and aged care sit alongside our broader Healthcare practice but face a distinct set of pressures worth treating separately: mandatory care-minute requirements introduced after the Aged Care Royal Commission have increased staffing demand in residential care at the same time the domestic registered nurse pipeline has tightened, and rural and remote communities face a long-standing shortage that metro-based recruitment simply doesn't solve.",
  "Many internationally qualified nurses are navigating AHPRA registration and Australian visa pathways for the first time. We work alongside registered migration agents (we are not a migration agency ourselves) to help candidates understand realistic timelines for registration, screening, and visa sponsorship — and we're upfront when a pathway will take longer than a candidate hopes.",
  "For rural and remote roles specifically, we look beyond clinical competence to genuine readiness for autonomous practice — many remote postings require a nurse to work confidently without on-site medical backup, coordinate retrievals, and support a community well beyond the scope of a typical metro ward role.",
  "For aged care employers: we screen for clinical governance experience and cultural fit with residential care specifically, not just acute hospital experience, because the two settings demand genuinely different skills.",
];

const ROLES = [
  "Registered Nurse — Aged Care", "Registered Nurse — Rural & Remote", "Enrolled Nurse",
  "Nurse Unit Manager", "Clinical Nurse Consultant", "Director of Nursing",
  "Community Health Nurse", "Mental Health Nurse", "Clinical Nurse Educator",
  "Care Coordinator", "International Nurse (Visa Pathway)", "Personal Care Worker",
];

export default async function NursingAgedCarePage() {
  const jobs = await getJobsByIndustry("Nursing & Aged Care");
  return (
    <IndustrySectorPage
      slug="nursing-aged-care"
      name="Nursing & Aged Care"
      overview={OVERVIEW}
      roles={ROLES}
      jobs={jobs}
    />
  );
}
