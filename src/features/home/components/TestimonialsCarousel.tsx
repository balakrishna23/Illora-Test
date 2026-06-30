"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";

import type { Review } from "@/server/integrations/reviews";

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

export function TestimonialsCarousel({ reviews }: { reviews: Review[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % reviews.length),
    [reviews.length]
  );
  const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  const review = reviews[current];

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          What People Say
        </h2>

        <div
          className="relative mt-10 mx-auto max-w-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            role="region"
            aria-label="Testimonials carousel"
            aria-live="polite"
          >
            <div className="rounded-2xl bg-card border border-border p-8 text-center shadow-sm">
              <StarRating rating={review.rating} />
              <blockquote className="mt-4 text-lg leading-relaxed text-foreground/90">
                &ldquo;{review.body}&rdquo;
              </blockquote>
              <div className="mt-6">
                <p className="font-semibold">{review.reviewerName}</p>
                <p className="text-sm text-muted-foreground">
                  {review.reviewerRole} · via {review.platform}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="rounded-full border border-border bg-card p-2 hover:bg-muted transition-colors"
            >
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
            </button>
            <div className="flex gap-1.5" role="tablist" aria-label="Testimonial indicators">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`size-2 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="rounded-full border border-border bg-card p-2 hover:bg-muted transition-colors"
            >
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
