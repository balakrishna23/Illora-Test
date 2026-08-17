import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getArticleBySlug, getAllArticles, getRecentArticles } from "@/features/knowledge-hub/queries";
import { SITE_URL } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/knowledge-hub/${slug}` },
  };
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getArticleBySlug(slug),
    getRecentArticles(3),
  ]);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishDate,
    author: { "@type": "Organization", name: "Illora" },
    publisher: {
      "@type": "Organization",
      name: "Illora",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
  };

  const relatedArticles = related.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Knowledge Hub", href: "/knowledge-hub" },
            { label: article.title, href: `/knowledge-hub/${article.slug}` },
          ]}
        />

        <div className="mt-8">
          <Badge variant="secondary">{article.category}</Badge>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-4" aria-hidden="true" />
              {new Date(article.publishDate).toLocaleDateString("en-AU", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-4" aria-hidden="true" />
              {article.readingTimeMinutes} min read
            </span>
            <span>By {article.author.name}</span>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Article body — real markdown-style content rendered as paragraphs.
            A line of the form ![alt text](/path/to/image.jpg) renders as a figure. */}
        <article className="space-y-5 text-base leading-relaxed text-foreground/90">
          {article.body.split("\n\n").map((block, i) => {
            const imageMatch = block.match(/^!\[(.*)\]\((.+)\)$/);
            if (imageMatch) {
              const [, alt, src] = imageMatch;
              return (
                <figure key={i} className="not-prose">
                  <div className="relative aspect-3/4 w-full max-w-md overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 448px"
                      className="object-cover object-top"
                    />
                  </div>
                  {alt && (
                    <figcaption className="mt-2 text-sm text-muted-foreground">{alt}</figcaption>
                  )}
                </figure>
              );
            }
            if (block.startsWith("**") && block.endsWith("**")) {
              return <h2 key={i} className="text-lg font-semibold mt-8">{block.slice(2, -2)}</h2>;
            }
            return <p key={i} className="text-muted-foreground">{block}</p>;
          })}
        </article>

        <Separator className="my-12" />

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg">More from the Knowledge Hub</h2>
            <div className="mt-4 space-y-3">
              {relatedArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/knowledge-hub/${a.slug}`}
                  className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors group"
                >
                  <Badge variant="secondary" className="text-xs mb-2">{a.category}</Badge>
                  <p className="text-sm font-medium group-hover:text-primary">{a.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/knowledge-hub"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
          Back to Knowledge Hub
        </Link>
      </div>
    </>
  );
}
