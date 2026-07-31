import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import type { Article } from "@/features/knowledge-hub/queries";

export function KnowledgeHubPreview({ articles }: { articles: Article[] }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              From the Knowledge Hub
            </h2>
            <p className="mt-1 text-muted-foreground">
              Hiring trends, career advice, and industry insights.
            </p>
          </div>
          <Link
            href="/knowledge-hub"
            className={buttonVariants({ variant: "outline" })}
          >
            View all articles
          </Link>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={i * 80} animation="fade-in-up">
              <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {article.readingTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="font-semibold leading-snug group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/knowledge-hub/${article.slug}`}
                    className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Read more
                    <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
