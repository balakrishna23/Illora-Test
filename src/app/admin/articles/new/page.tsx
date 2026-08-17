import type { Metadata } from "next";

import { ArticleForm } from "@/features/admin/articles/components/ArticleForm";

export const metadata: Metadata = {
  title: "Admin — New Article",
  robots: { index: false, follow: false },
};

export default function AdminNewArticlePage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">New article</h2>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <ArticleForm />
      </div>
    </div>
  );
}
