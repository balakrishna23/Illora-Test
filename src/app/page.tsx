import { getRecentJobs } from "@/server/integrations/jobadder";
import { jsonLdString } from "@/lib/utils";
import { getRecentArticles, getSiteStats } from "@/server/integrations/sanity";
import { getReviews } from "@/server/integrations/reviews";

import { HomeHero } from "@/features/home/components/HomeHero";
import { JobTicker } from "@/features/home/components/JobTicker";
import { NameMeaning } from "@/features/home/components/NameMeaning";
import { IndustryTiles } from "@/features/home/components/IndustryTiles";
import { Clients } from "@/features/home/components/Clients";
import { Accreditations } from "@/features/home/components/Accreditations";
import { TestimonialsCarousel } from "@/features/home/components/TestimonialsCarousel";
import { KnowledgeHubPreview } from "@/features/home/components/KnowledgeHubPreview";
import { DualCtaBand } from "@/features/home/components/DualCtaBand";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Illoura Services",
  description:
    "First Nations-owned recruitment delivering real outcomes across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling.",
  url: "https://illouraservices.com",
  logo: "https://illouraservices.com/logo.png",
  sameAs: [],
};

export default async function Home() {
  const [stats, jobs, articles, reviews] = await Promise.all([
    getSiteStats(),
    getRecentJobs(4),
    getRecentArticles(3),
    getReviews(6),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(orgJsonLd) }}
      />
      <HomeHero stats={stats} />
      <JobTicker jobs={jobs} />
      <IndustryTiles />
      <Accreditations />
      <Clients />
      <TestimonialsCarousel reviews={reviews} />
      <NameMeaning />
      <KnowledgeHubPreview articles={articles} />
      <DualCtaBand />
    </>
  );
}
