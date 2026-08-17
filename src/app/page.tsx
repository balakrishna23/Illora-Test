import type { Metadata } from "next";

import { getRecentJobs } from "@/server/integrations/jobadder";
import { jsonLdString } from "@/lib/utils";
import { ORGANIZATION_JSON_LD } from "@/lib/organization-schema";
import { getRecentArticles } from "@/features/knowledge-hub/queries";
import { getSiteStats } from "@/features/home/queries";
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

export const metadata: Metadata = {
  title: {
    absolute: "Illora — First Nations-Owned Recruitment Across Australia",
  },
  description:
    "Illora connects candidates and employers across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling. Supply Nation Registered.",
  alternates: { canonical: "/" },
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
        dangerouslySetInnerHTML={{ __html: jsonLdString(ORGANIZATION_JSON_LD) }}
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
