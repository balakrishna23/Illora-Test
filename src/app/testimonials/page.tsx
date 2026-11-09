import type { Metadata } from "next";
import { jsonLdString } from "@/lib/utils";
import { StarIcon, ExternalLinkIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getReviews, getAggregateRating } from "@/server/integrations/reviews";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Client and candidate reviews of Illoura from Google and Sourcr.",
  alternates: { canonical: "/testimonials" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`size-4 ${i < rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const [reviews, aggregate] = await Promise.all([
    getReviews(),
    getAggregateRating(),
  ]);

  const aggregateJsonLd = aggregate && {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Illoura",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: aggregate.averageRating,
      reviewCount: aggregate.totalReviews,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <>
      {aggregateJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(aggregateJsonLd) }}
        />
      )}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Testimonials", href: "/testimonials" },
          ]}
        />

        {/* Aggregate rating */}
        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Testimonials</h1>
            {aggregate ? (
              <div className="mt-3 flex items-center gap-3">
                <p className="text-4xl font-semibold">{aggregate.averageRating}</p>
                <div>
                  <StarRating rating={Math.round(aggregate.averageRating)} />
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {aggregate.totalReviews} {aggregate.totalReviews === 1 ? "review" : "reviews"} · {aggregate.platform}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">
                We&apos;re a young business, and reviews from the people we work with will appear here.
              </p>
            )}
          </div>
          <a
            href="https://g.page/r/illora/review"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Leave a review
            <ExternalLinkIcon className="ml-1.5 size-3.5" aria-hidden="true" />
          </a>
        </div>

        {/* Reviews grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <StarRating rating={review.rating} />
                <blockquote className="flex-1 text-sm text-foreground/85 leading-relaxed">
                  &ldquo;{review.body}&rdquo;
                </blockquote>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold">{review.reviewerName}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{review.reviewerRole}</Badge>
                    <span className="text-xs text-muted-foreground">via {review.platform}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-muted/50 border border-border p-8 text-center">
          <h2 className="text-xl font-semibold">Worked with us?</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;d genuinely appreciate hearing from you.
          </p>
          <a
            href="https://g.page/r/illora/review"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "accent", className: "mt-5" })}
          >
            Leave a review on Google
          </a>
        </div>
      </div>
    </>
  );
}
