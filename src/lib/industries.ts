import {
  BrainCircuitIcon,
  ShieldAlertIcon,
  ChartColumnIcon,
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
    slug: "ai-engineering",
    name: "AI Engineering",
    icon: BrainCircuitIcon,
    shortDescription:
      "Machine learning engineers, LLM and applied AI engineers, and MLOps specialists who take AI from prototype to production.",
  },
  {
    slug: "cyber-security",
    name: "Cyber Security",
    icon: ShieldAlertIcon,
    shortDescription:
      "SOC analysts, penetration testers, and security leaders defending critical infrastructure across government and the private sector.",
  },
  {
    slug: "data-analytics",
    name: "Data Analytics",
    icon: ChartColumnIcon,
    shortDescription:
      "Data analysts, data engineers, BI developers, and data scientists turning raw data into decisions organisations can act on.",
  },
];
