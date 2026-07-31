import { desc, eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";

export type AdminArticle = typeof articles.$inferSelect;

export async function getAllArticlesAdmin(): Promise<AdminArticle[]> {
  return db.select().from(articles).orderBy(desc(articles.publishDate));
}

export async function getArticleByIdAdmin(id: string): Promise<AdminArticle | null> {
  const [row] = await db.select().from(articles).where(eq(articles.id, id));
  return row ?? null;
}
