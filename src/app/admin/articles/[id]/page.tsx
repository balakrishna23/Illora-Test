import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getArticleByIdAdmin } from "@/features/admin/articles/queries";
import { ArticleForm } from "@/features/admin/articles/components/ArticleForm";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Admin — Edit Article",
};

export default async function AdminEditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleByIdAdmin(id);
  if (!article) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold">Edit article</h2>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
