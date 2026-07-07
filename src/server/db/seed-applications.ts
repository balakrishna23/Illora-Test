import { db } from "@/server/db/client";
import { applications, jobs } from "@/server/db/schema";

type MockApplication = {
  name: string;
  email: string;
  phone: string;
  targetIndustry: string;
  currentRole: string;
  linkedIn?: string;
  status: (typeof applications.$inferInsert)["status"];
  jobIndustryHint?: string; // tie to a real job in this industry if one exists
};

const MOCK_APPLICATIONS: MockApplication[] = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+61 412 345 678",
    targetIndustry: "IT & Telecommunications",
    currentRole: "Network Engineer",
    linkedIn: "https://linkedin.com/in/priya-sharma-example",
    status: "interviewing",
    jobIndustryHint: "IT & Telecommunications",
  },
  {
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "+61 423 456 789",
    targetIndustry: "Construction",
    currentRole: "Assistant Site Manager",
    status: "submitted",
    jobIndustryHint: "Construction",
  },
  {
    name: "Aroha Ngata",
    email: "aroha.ngata@example.com",
    phone: "+61 434 567 890",
    targetIndustry: "Healthcare",
    currentRole: "Registered Nurse",
    linkedIn: "https://linkedin.com/in/aroha-ngata-example",
    status: "under_review",
    jobIndustryHint: "Healthcare",
  },
  {
    name: "Liam Chen",
    email: "liam.chen@example.com",
    phone: "+61 445 678 901",
    targetIndustry: "Cyber Security",
    currentRole: "SOC Analyst (Level 1)",
    status: "offered",
    jobIndustryHint: "Cyber Security",
  },
  {
    name: "Sarah Thompson",
    email: "sarah.thompson@example.com",
    phone: "+61 456 789 012",
    targetIndustry: "Data Science",
    currentRole: "Data Analyst",
    linkedIn: "https://linkedin.com/in/sarah-thompson-example",
    status: "rejected",
    jobIndustryHint: "Data Science",
  },
  {
    name: "Marcus Williams",
    email: "marcus.williams@example.com",
    phone: "+61 467 890 123",
    targetIndustry: "Nursing & Aged Care",
    currentRole: "Personal Care Worker",
    status: "submitted",
    // no job tie — a general/speculative submission
  },
  {
    name: "Emily Nguyen",
    email: "emily.nguyen@example.com",
    phone: "+61 478 901 234",
    targetIndustry: "EV Waste & Recycling",
    currentRole: "Environmental Compliance Officer",
    linkedIn: "https://linkedin.com/in/emily-nguyen-example",
    status: "interviewing",
    jobIndustryHint: "EV Waste & Recycling",
  },
  {
    name: "David O'Brien",
    email: "david.obrien@example.com",
    phone: "+61 489 012 345",
    targetIndustry: "IT & Telecommunications",
    currentRole: "DevOps Engineer",
    status: "submitted",
    // general submission
  },
  {
    name: "Grace Anderson",
    email: "grace.anderson@example.com",
    phone: "+61 490 123 456",
    targetIndustry: "Cyber Security",
    currentRole: "Penetration Tester",
    linkedIn: "https://linkedin.com/in/grace-anderson-example",
    status: "withdrawn",
    jobIndustryHint: "Cyber Security",
  },
  {
    name: "Noah Fitzgerald",
    email: "noah.fitzgerald@example.com",
    phone: "+61 401 234 567",
    targetIndustry: "Construction",
    currentRole: "Civil Estimator",
    status: "under_review",
    jobIndustryHint: "Construction",
  },
];

async function main() {
  const allJobs = await db.select().from(jobs);

  const rows = MOCK_APPLICATIONS.map((mock) => {
    const matchedJob = mock.jobIndustryHint
      ? allJobs.find((job) => job.industry === mock.jobIndustryHint)
      : undefined;

    return {
      name: mock.name,
      email: mock.email,
      phone: mock.phone,
      targetIndustry: mock.targetIndustry,
      currentRole: mock.currentRole,
      linkedIn: mock.linkedIn,
      status: mock.status,
      resumeR2Key: `resumes/mock-${mock.name.toLowerCase().replace(/[^a-z]+/g, "-")}.pdf`,
      jobId: matchedJob?.id ?? null,
      jobSlug: matchedJob?.slug ?? null,
      jobTitle: matchedJob?.title ?? null,
    };
  });

  const inserted = await db.insert(applications).values(rows).returning({ name: applications.name });
  console.log(`Seeded ${inserted.length} mock applications.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
