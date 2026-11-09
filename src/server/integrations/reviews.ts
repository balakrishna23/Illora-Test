export type Review = {
  id: string;
  reviewerName: string;
  reviewerRole: "Candidate" | "Client";
  rating: number;
  date: string;
  body: string;
  platform: "Google" | "Sourcr";
};

export type AggregateRating = {
  averageRating: number;
  totalReviews: number;
  platform: string;
};

// Real reviews only. Add an entry here when a client or candidate leaves a
// genuine review (copy it verbatim from Google or Sourcr). While this list is
// empty, the homepage carousel and the rating summary stay hidden.
const REVIEWS: Review[] = [];

export async function getReviews(count?: number): Promise<Review[]> {
  return count ? REVIEWS.slice(0, count) : REVIEWS;
}

export async function getAggregateRating(): Promise<AggregateRating | null> {
  if (REVIEWS.length === 0) return null;
  const total = REVIEWS.reduce((sum, r) => sum + r.rating, 0);
  return {
    averageRating: Math.round((total / REVIEWS.length) * 10) / 10,
    totalReviews: REVIEWS.length,
    platform: [...new Set(REVIEWS.map((r) => r.platform))].join(" & "),
  };
}
