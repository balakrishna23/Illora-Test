import type { MetadataRoute } from "next";

import { getAllJobs } from "@/server/integrations/jobadder";
import { getAllArticles } from "@/server/integrations/sanity";

// Served on demand rather than prerendered — building it would open DB
// connections from every build worker and can exhaust the Supabase pool.
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const STATIC_ROUTES = [
  "",
  "/about",
  "/about/capability-statement",
  "/about/first-nations-partnership",
  "/candidates",
  "/candidates/career-advice",
  "/candidates/submit-cv",
  "/contact",
  "/employers",
  "/employers/contract",
  "/employers/embedded-rpo",
  "/employers/permanent",
  "/employers/register-vacancy",
  "/industries",
  "/industries/construction",
  "/industries/cyber-security",
  "/industries/data-science",
  "/industries/ev-waste",
  "/industries/healthcare",
  "/industries/it-telecommunications",
  "/industries/nursing-aged-care",
  "/jobs",
  "/knowledge-hub",
  "/privacy-policy",
  "/terms-of-service",
  "/testimonials",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, articles] = await Promise.all([getAllJobs(), getAllArticles()]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...jobs.map((job) => ({
      url: `${SITE_URL}/jobs/${job.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/knowledge-hub/${article.slug}`,
      lastModified: article.publishDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
