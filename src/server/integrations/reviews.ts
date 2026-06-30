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

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    reviewerName: "Michael T.",
    reviewerRole: "Candidate",
    rating: 5,
    date: "2026-05-18",
    body: "Illora placed me in a Senior Network Engineer role within three weeks. The team was honest about timelines, prepped me thoroughly for the interview, and followed up after I started. Best recruitment experience I've had in 15 years.",
    platform: "Google",
  },
  {
    id: "2",
    reviewerName: "Priya S.",
    reviewerRole: "Client",
    rating: 5,
    date: "2026-05-02",
    body: "We've used Illora for three consecutive hires in our IT infrastructure team. What sets them apart is that they actually understand the roles they're filling — they don't just keyword-match. Every candidate they've submitted has been genuinely suitable.",
    platform: "Sourcr",
  },
  {
    id: "3",
    reviewerName: "James R.",
    reviewerRole: "Candidate",
    rating: 5,
    date: "2026-04-15",
    body: "Relocated from Perth for a construction management role Illora found for me. They negotiated the relocation package, kept me informed throughout the process, and even checked in three months after I started. Genuinely above and beyond.",
    platform: "Google",
  },
  {
    id: "4",
    reviewerName: "Dr. Angela M.",
    reviewerRole: "Client",
    rating: 5,
    date: "2026-03-30",
    body: "As a healthcare provider, finding quality nursing staff is our biggest operational challenge. Illora consistently delivers candidates who are not only clinically qualified but genuinely aligned with our values. Our retention rate with Illora-placed nurses is significantly higher than with other agencies.",
    platform: "Sourcr",
  },
  {
    id: "5",
    reviewerName: "David K.",
    reviewerRole: "Candidate",
    rating: 5,
    date: "2026-03-10",
    body: "After being made redundant, I was anxious about the job market. Illora's team gave me an honest picture of where I sat, helped me update how I was positioning myself, and had me in interviews within two weeks. Landed a role 10% above my previous salary.",
    platform: "Google",
  },
  {
    id: "6",
    reviewerName: "Tracey N.",
    reviewerRole: "Client",
    rating: 4,
    date: "2026-02-20",
    body: "Strong experience overall. The team is responsive, the candidate quality is high, and the fact that they're Indigenous-owned was important to us given our own procurement commitments. Will definitely use again.",
    platform: "Sourcr",
  },
];

const AGGREGATE: AggregateRating = {
  averageRating: 4.9,
  totalReviews: 62,
  platform: "Google & Sourcr",
};

export async function getReviews(count?: number): Promise<Review[]> {
  return count ? MOCK_REVIEWS.slice(0, count) : MOCK_REVIEWS;
}

export async function getAggregateRating(): Promise<AggregateRating> {
  return AGGREGATE;
}
