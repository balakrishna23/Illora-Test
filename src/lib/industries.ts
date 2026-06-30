import {
  MonitorIcon,
  HardHatIcon,
  HeartPulseIcon,
  BrainCircuitIcon,
  ShieldAlertIcon,
  RecycleIcon,
  StethoscopeIcon,
  type LucideIcon,
} from "lucide-react";

export type IndustryMeta = {
  slug: string;
  name: string;
  icon: LucideIcon;
  shortDescription: string;
};

export const INDUSTRIES: IndustryMeta[] = [
  {
    slug: "it-telecommunications",
    name: "IT & Telecommunications",
    icon: MonitorIcon,
    shortDescription:
      "From network engineers to DevOps and project managers, we source technical talent that delivers — for enterprise, government, and high-growth environments.",
  },
  {
    slug: "construction",
    name: "Construction",
    icon: HardHatIcon,
    shortDescription:
      "Site managers, estimators, schedulers, and WHS professionals across commercial, civil, and government infrastructure projects.",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: HeartPulseIcon,
    shortDescription:
      "Allied health professionals and clinical leaders placed with purpose-driven providers across acute, community, and primary care settings.",
  },
  {
    slug: "nursing-aged-care",
    name: "Nursing & Aged Care",
    icon: StethoscopeIcon,
    shortDescription:
      "Registered and enrolled nurses for residential aged care and rural and remote postings, with visa and migration support for international candidates.",
  },
  {
    slug: "data-science",
    name: "Data Science",
    icon: BrainCircuitIcon,
    shortDescription:
      "Data scientists, ML engineers, and data engineers building the analytics and AI capability behind modern decision-making.",
  },
  {
    slug: "cyber-security",
    name: "Cyber Security",
    icon: ShieldAlertIcon,
    shortDescription:
      "SOC analysts, penetration testers, and security leaders defending critical infrastructure across government and the private sector.",
  },
  {
    slug: "ev-waste",
    name: "EV Waste & Recycling",
    icon: RecycleIcon,
    shortDescription:
      "Technicians, compliance, and sustainability leaders building Australia's battery and e-waste circular economy.",
  },
];
