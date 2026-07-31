"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db/client";
import { articles, articleCategoryValues } from "@/server/db/schema";
import { requireAdmin } from "@/server/auth/session";

const articleSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  category: z.enum(articleCategoryValues),
  publishDate: z.string().min(1, "Publish date is required"),
  readingTimeMinutes: z.coerce.number().int().positive(),
  excerpt: z.string().min(10, "Excerpt is required"),
  body: z.string().min(10, "Body is required"),
  authorName: z.string().min(2, "Author name is required"),
  authorRole: z.string().min(2, "Author role is required"),
});

export type ArticleFormState =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireAdminOrError(): Promise<{ error: string } | null> {
  const session = await requireAdmin();
  return session.success ? null : { error: session.error };
}

export async function createArticle(
  _prev: ArticleFormState | null,
  formData: FormData
): Promise<ArticleFormState> {
  const denied = await requireAdminOrError();
  if (denied) return { success: false, error: denied.error };

  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const [existing] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, parsed.data.slug))
    .limit(1);
  if (existing) {
    return {
      success: false,
      error: "An article with this slug already exists.",
      fieldErrors: { slug: ["This slug is already in use."] },
    };
  }

  await db.insert(articles).values(parsed.data);

  revalidatePath("/admin/articles");
  revalidatePath("/knowledge-hub");
  revalidatePath("/");

  return { success: true };
}

export async function updateArticle(
  id: string,
  _prev: ArticleFormState | null,
  formData: FormData
): Promise<ArticleFormState> {
  const denied = await requireAdminOrError();
  if (denied) return { success: false, error: denied.error };

  const parsed = articleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const [conflicting] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, parsed.data.slug))
    .limit(1);
  if (conflicting && conflicting.id !== id) {
    return {
      success: false,
      error: "Another article already uses this slug.",
      fieldErrors: { slug: ["This slug is already in use."] },
    };
  }

  await db
    .update(articles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(articles.id, id));

  revalidatePath("/admin/articles");
  revalidatePath("/knowledge-hub");
  revalidatePath(`/knowledge-hub/${parsed.data.slug}`);
  revalidatePath("/");

  return { success: true };
}

export async function deleteArticle(id: string): Promise<{ success: boolean }> {
  const session = await requireAdmin();
  if (!session.success) return { success: false };

  await db.delete(articles).where(eq(articles.id, id));

  revalidatePath("/admin/articles");
  revalidatePath("/knowledge-hub");
  revalidatePath("/");

  return { success: true };
}
