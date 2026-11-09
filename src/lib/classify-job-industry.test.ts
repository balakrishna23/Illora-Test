import { describe, expect, it } from "vitest";

import { classifyJobIndustry } from "@/lib/classify-job-industry";

describe("classifyJobIndustry", () => {
  it.each([
    ["Machine Learning Engineer", "AI Engineering"],
    ["Senior AI Engineer", "AI Engineering"],
    ["MLOps Platform Engineer", "AI Engineering"],
    ["Generative AI Solutions Architect", "AI Engineering"],
    ["Machine Learning Data Engineer", "AI Engineering"],
    ["Cyber Security Analyst", "Cyber Security"],
    ["SOC Analyst - Level 2", "Cyber Security"],
    ["Penetration Tester", "Cyber Security"],
    ["ICT Security Advisor", "Cyber Security"],
    ["Identity and Access Management Specialist", "Cyber Security"],
    ["Senior Data Analyst", "Data Analytics"],
    ["Data Engineer (Contract)", "Data Analytics"],
    ["Business Intelligence Developer", "Data Analytics"],
    ["Power BI Reporting Specialist", "Data Analytics"],
    ["Principal Statistician", "Data Analytics"],
  ])("classifies %s as %s", (title, expected) => {
    expect(classifyJobIndustry(title)).toBe(expected);
  });

  it.each([
    "Registered Nurse - Aged Care",
    "Clinical Nurse Specialist",
    "Site Manager - Commercial Construction",
    "Electrician",
    "Security Guard",
    "Protective Services Officer",
    "Data Entry Clerk",
    "Allied Health Assistant",
    "Waste Collection Driver",
    "Policy Officer",
    "Maintenance Planner",
  ])("skips non-IT role %s", (title) => {
    expect(classifyJobIndustry(title)).toBeNull();
  });
});
