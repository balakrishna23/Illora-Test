import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { articles, articleCategoryValues } from "@/server/db/schema";

export { ARTICLE_CATEGORIES } from "@/lib/article-constants";

export type Article = {
  slug: string;
  title: string;
  category: (typeof articleCategoryValues)[number];
  publishDate: string;
  readingTimeMinutes: number;
  excerpt: string;
  body: string;
  author: { name: string; role: string };
};

function toArticle(row: typeof articles.$inferSelect): Article {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    publishDate: row.publishDate,
    readingTimeMinutes: row.readingTimeMinutes,
    excerpt: row.excerpt,
    body: row.body,
    author: { name: row.authorName, role: row.authorRole },
  };
}

export async function getRecentArticles(count = 3): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishDate))
    .limit(count);
  return rows.map(toArticle);
}

export async function getAllArticles(): Promise<Article[]> {
  const rows = await db.select().from(articles).orderBy(desc(articles.publishDate));
  return rows.map(toArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const [row] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return row ? toArticle(row) : null;
}

export async function getArticlesByCategory(category: Article["category"]): Promise<Article[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.category, category))
    .orderBy(desc(articles.publishDate));
  return rows.map(toArticle);
}
