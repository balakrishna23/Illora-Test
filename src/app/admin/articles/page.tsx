import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAllArticlesAdmin } from "@/features/admin/articles/queries";
import { ArticleRowActions } from "@/features/admin/articles/components/ArticleRowActions";

export const metadata: Metadata = {
  title: "Admin — Articles",
};

export default async function AdminArticlesPage() {
  const articles = await getAllArticlesAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Knowledge Hub articles ({articles.length})</h2>
        <Link href="/admin/articles/new" className={buttonVariants({ variant: "accent", size: "sm" })}>
          New article
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Published</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link href={`/admin/articles/${article.id}`} className="font-medium hover:text-primary">
                    {article.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{article.category}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{article.publishDate}</td>
                <td className="px-4 py-3">
                  <ArticleRowActions id={article.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
