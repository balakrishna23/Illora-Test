import type { jobs } from "@/server/db/schema";

type SeedJob = typeof jobs.$inferInsert;

// Seed content for the `jobs` table — migrated verbatim from the retired
// MOCK_JOBS array in src/server/integrations/jobadder.ts. Fresh UUIDs are
// generated on insert; the old "1".."14" ids are not preserved.
export const SEED_JOBS: SeedJob[] = [
  {
    slug: "data-scientist-sydney",
    title: "Data Scientist",
    location: "Sydney",
    state: "NSW",
    latitude: -33.8688,
    longitude: 151.2093,
    type: "Permanent",
    industry: "Data Analytics",
    salaryRange: "$130,000 – $155,000",
    postedDate: "2026-07-02",
    closingDate: "2026-08-02",
    referenceNumber: "IL-007",
    teaser:
      "Join a fast-growing analytics team building forecasting and customer-segmentation models for a major retail group.",
    description:
      "Our client, a national retail group, is seeking a Data Scientist to join their central analytics team in Sydney, working on demand forecasting, pricing, and customer segmentation models.",
    responsibilities: [
      "Build and maintain forecasting and segmentation models in Python",
      "Partner with engineering to productionise models via MLOps pipelines",
      "Translate business questions into measurable analytical problems",
      "Present findings and recommendations to non-technical stakeholders",
    ],
    requirements: [
      "3+ years in a data science or applied ML role",
      "Strong Python (pandas, scikit-learn) and SQL skills",
      "Experience with cloud ML platforms (SageMaker, Vertex AI, or similar)",
      "Tertiary qualification in statistics, computer science, or related field",
    ],
    benefits: [
      "Hybrid working (3 days in-office)",
      "Dedicated learning and conference budget",
      "Direct exposure to executive decision-making",
    ],
  },
  {
    slug: "senior-data-engineer-melbourne",
    title: "Senior Data Engineer (Contract)",
    location: "Melbourne",
    state: "VIC",
    latitude: -37.8136,
    longitude: 144.9631,
    type: "Contract",
    industry: "Data Analytics",
    salaryRange: "$1,000 – $1,150/day",
    postedDate: "2026-07-03",
    closingDate: "2026-08-03",
    referenceNumber: "IL-008",
    teaser:
      "9-month contract building a cloud data platform for a major superannuation fund. Strong dbt and Snowflake experience required.",
    description:
      "A major superannuation fund is building out a modern data platform and requires a Senior Data Engineer to design and implement scalable data pipelines.",
    responsibilities: [
      "Design and build ELT pipelines using dbt and Snowflake",
      "Implement data quality and observability frameworks",
      "Optimise warehouse performance and cost",
      "Mentor junior data engineers on the team",
    ],
    requirements: [
      "5+ years data engineering experience",
      "Hands-on Snowflake and dbt expertise",
      "Strong understanding of data modelling (Kimball or Data Vault)",
      "Financial services experience highly regarded",
    ],
    benefits: [
      "Top-of-market contract rate",
      "Hybrid working arrangement",
      "High likelihood of extension",
    ],
  },
  {
    slug: "soc-analyst-canberra",
    title: "SOC Analyst (Level 2)",
    location: "Canberra",
    state: "ACT",
    latitude: -35.2809,
    longitude: 149.13,
    type: "Permanent",
    industry: "Cyber Security",
    salaryRange: "$110,000 – $130,000",
    postedDate: "2026-07-04",
    closingDate: "2026-08-04",
    referenceNumber: "IL-011",
    teaser:
      "Join a 24/7 Security Operations Centre supporting federal government clients. NV1 clearance required.",
    description:
      "A leading managed security services provider is expanding its Canberra-based SOC and is seeking a Level 2 Analyst to triage, investigate, and respond to security incidents for federal government clients.",
    responsibilities: [
      "Monitor and triage alerts via SIEM (Splunk / Sentinel)",
      "Conduct initial incident investigation and escalation",
      "Tune detection rules to reduce false positives",
      "Produce incident reports for government stakeholders",
    ],
    requirements: [
      "NV1 security clearance (current and valid)",
      "2+ years SOC or incident response experience",
      "Familiarity with MITRE ATT&CK framework",
      "Security+ or equivalent certification preferred",
    ],
    benefits: [
      "Shift allowance for rotating roster",
      "Clearance sponsorship support for upgrades",
      "Clear progression to Level 3 / Threat Hunter",
    ],
  },
  {
    slug: "penetration-tester-brisbane",
    title: "Penetration Tester (Contract)",
    location: "Brisbane",
    state: "QLD",
    latitude: -27.4698,
    longitude: 153.0251,
    type: "Contract",
    industry: "Cyber Security",
    salaryRange: "$1,100 – $1,300/day",
    postedDate: "2026-07-05",
    closingDate: "2026-08-05",
    referenceNumber: "IL-012",
    teaser:
      "4-month engagement delivering web application and infrastructure penetration tests for a financial services client.",
    description:
      "A Brisbane-based financial services organisation requires an experienced Penetration Tester for a series of web application, API, and infrastructure security assessments.",
    responsibilities: [
      "Conduct black-box and grey-box penetration tests",
      "Deliver clear, actionable findings reports to technical and executive audiences",
      "Validate remediation of previously identified vulnerabilities",
      "Work within agreed rules of engagement and change windows",
    ],
    requirements: [
      "OSCP or equivalent offensive security certification",
      "3+ years professional penetration testing experience",
      "Strong understanding of OWASP Top 10 and common attack chains",
      "Financial services or regulated industry experience highly regarded",
    ],
    benefits: [
      "Strong contract rate",
      "Variety across web, API, and infrastructure testing",
      "Potential for ongoing panel work",
    ],
  },
];
