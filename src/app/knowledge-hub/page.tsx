import type { Metadata } from "next";
import Link from "next/link";
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { cn, jsonLdString } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";
import {
  getAllArticles,
  ARTICLE_CATEGORIES,
  type Article,
} from "@/features/knowledge-hub/queries";

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description:
    "Hiring trends, candidate advice, First Nations procurement insights, and industry news from the Illora team.",
  alternates: { canonical: "/knowledge-hub" },
};

type PageProps = {
  searchParams: Promise<{ category?: string }>;
};

function isArticleCategory(value: string): value is Article["category"] {
  return (ARTICLE_CATEGORIES as readonly string[]).includes(value);
}

export default async function KnowledgeHubPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const activeCategory = category && isArticleCategory(category) ? category : null;

  const allArticles = await getAllArticles();
  const articles = activeCategory
    ? allArticles.filter((a) => a.category === activeCategory)
    : allArticles;

  const featured = !activeCategory ? articles[0] : null;
  const rest = featured ? articles.slice(1) : articles;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Illora Knowledge Hub",
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/knowledge-hub/${article.slug}`,
      name: article.title,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(itemListJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Knowledge Hub", href: "/knowledge-hub" },
        ]}
      />

      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">Knowledge Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Hiring trends, career advice, and procurement insights from our team.
        </p>
      </div>

      {/* Category filter links */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/knowledge-hub">
          <Badge
            variant={activeCategory ? "outline" : "default"}
            className={cn("cursor-pointer", !activeCategory ? undefined : "hover:bg-muted")}
          >
            All
          </Badge>
        </Link>
        {ARTICLE_CATEGORIES.map((cat) => (
          <Link key={cat} href={`/knowledge-hub?category=${encodeURIComponent(cat)}`}>
            <Badge
              variant={activeCategory === cat ? "default" : "outline"}
              className={cn("cursor-pointer", activeCategory === cat ? undefined : "hover:bg-muted")}
            >
              {cat}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">No articles in this category yet.</p>
          <Link
            href="/knowledge-hub"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            View all articles
          </Link>
        </div>
      )}

      {/* Featured article (only on the unfiltered view) */}
      {featured && (
        <Link
          href={`/knowledge-hub/${featured.slug}`}
          className="group mt-8 block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="bg-primary/5 p-8">
            <Badge variant="secondary">{featured.category}</Badge>
            <h2 className="mt-3 text-2xl font-semibold leading-snug group-hover:text-primary">
              {featured.title}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{featured.excerpt}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3.5" aria-hidden="true" />
                {new Date(featured.publishDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3.5" aria-hidden="true" />
                {featured.readingTimeMinutes} min read
              </span>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read article <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      )}

      {/* Article grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((article) => (
          <Card key={article.slug} className="group flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ClockIcon className="size-3" aria-hidden="true" />
                  {article.readingTimeMinutes} min
                </span>
              </div>
              <h2 className="font-semibold leading-snug group-hover:text-primary">
                {article.title}
              </h2>
              <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(article.publishDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <Link
                  href={`/knowledge-hub/${article.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read <ArrowRightIcon className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
