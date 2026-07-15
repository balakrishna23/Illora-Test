import { ShieldCheckIcon, UsersIcon, TrendingUpIcon, StarIcon } from "lucide-react";

import type { SiteStats } from "@/server/integrations/sanity";
import type { AggregateRating } from "@/server/integrations/reviews";
import { Reveal } from "@/components/shared/Reveal";

export function TrustStrip({
  stats,
  rating,
}: {
  stats: SiteStats;
  rating: AggregateRating;
}) {
  const items = [
    {
      icon: ShieldCheckIcon,
      value: "Supply Nation",
      label: "Registered Indigenous Business",
    },
    {
      icon: TrendingUpIcon,
      value: `${stats.yearsOperating}+ years`,
      label: "Recruiting across Australia",
    },
    {
      icon: UsersIcon,
      value: `${stats.candidatesPlaced.toLocaleString()}+`,
      label: "Candidates successfully placed",
    },
    {
      icon: StarIcon,
      value: `${rating.averageRating}/5`,
      label: `From ${rating.totalReviews} client & candidate reviews`,
    },
  ];

  return (
    <section className="border-y border-border bg-primary py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {items.map(({ icon: Icon, value, label }, i) => (
            <Reveal key={label} delay={i * 80} animation="fade-in-up">
              <div className="flex flex-col items-center text-center text-primary-foreground">
                <Icon className="mb-2 size-6 text-accent" aria-hidden="true" />
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-primary-foreground/70">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
