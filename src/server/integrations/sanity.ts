import { sanityClient } from "@/sanity/client";
import { ARTICLE_CATEGORIES as SCHEMA_ARTICLE_CATEGORIES } from "@/sanity/schemaTypes/article";

export type Article = {
  slug: string;
  title: string;
  category: "Hiring Trends" | "Candidate Advice" | "First Nations Procurement" | "Industry Insights";
  publishDate: string;
  readingTimeMinutes: number;
  excerpt: string;
  body: string;
  author: { name: string; role: string };
};

export type TeamMember = {
  name: string;
  role: string;
  culturalConnection?: string;
  bio: string;
  linkedIn?: string;
};

export type SiteStats = {
  yearsOperating: number;
  candidatesPlaced: number;
  clientRetentionPct: number;
  activeEmployers: number;
};

// Shown only until a real `siteStats` document exists in Sanity — keeps the
// homepage/About page from displaying zeros while the CMS is being set up.
const FALLBACK_STATS: SiteStats = {
  yearsOperating: 8,
  candidatesPlaced: 1200,
  clientRetentionPct: 94,
  activeEmployers: 80,
};

const ARTICLE_PROJECTION = `{
  "slug": slug.current,
  title,
  category,
  publishDate,
  readingTimeMinutes,
  excerpt,
  body,
  "author": { "name": authorName, "role": authorRole }
}`;

async function safeFetch<T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> {
  if (!sanityClient) return fallback;

  try {
    const result = await sanityClient.fetch<T>(query, params);
    return result ?? fallback;
  } catch (error) {
    console.error("Sanity fetch failed", error);
    return fallback;
  }
}

export async function getRecentArticles(count = 3): Promise<Article[]> {
  return safeFetch<Article[]>(
    `*[_type == "article"] | order(publishDate desc) [0...$count] ${ARTICLE_PROJECTION}`,
    { count },
    []
  );
}

export async function getAllArticles(): Promise<Article[]> {
  return safeFetch<Article[]>(
    `*[_type == "article"] | order(publishDate desc) ${ARTICLE_PROJECTION}`,
    {},
    []
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return safeFetch<Article | null>(
    `*[_type == "article" && slug.current == $slug][0] ${ARTICLE_PROJECTION}`,
    { slug },
    null
  );
}

export async function getArticlesByCategory(category: Article["category"]): Promise<Article[]> {
  return safeFetch<Article[]>(
    `*[_type == "article" && category == $category] | order(publishDate desc) ${ARTICLE_PROJECTION}`,
    { category },
    []
  );
}

export async function getTeam(): Promise<TeamMember[]> {
  return safeFetch<TeamMember[]>(
    `*[_type == "teamMember"] | order(order asc) {name, role, culturalConnection, bio, linkedIn}`,
    {},
    []
  );
}

export async function getSiteStats(): Promise<SiteStats> {
  return safeFetch<SiteStats>(
    `*[_type == "siteStats"][0]{yearsOperating, candidatesPlaced, clientRetentionPct, activeEmployers}`,
    {},
    FALLBACK_STATS
  );
}

export const ARTICLE_CATEGORIES: Article["category"][] = [...SCHEMA_ARTICLE_CATEGORIES];
