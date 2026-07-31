import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { IlloraLogo } from "@/components/shared/IlloraLogo";
import type { SiteStats } from "@/features/home/queries";

export function HomeHero({ stats }: { stats: SiteStats }) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground" style={{ background: "radial-gradient(ellipse 80% 90% at 65% 50%, oklch(0.46 0.16 40) 0%, oklch(0.32 0.13 24) 60%, oklch(0.26 0.10 20) 100%)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="max-w-3xl animate-slide-in-left">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
            Supply Nation Registered · First Nations Owned
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Recruitment that delivers real outcomes
            <span className="mt-2 block text-2xl font-medium text-accent sm:text-3xl lg:text-4xl">
              for people and employers
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
            {stats.candidatesPlaced.toLocaleString()}+ placements across seven
            specialist sectors, Australia-wide.{" "}
            {stats.clientRetentionPct}% client retention. {stats.yearsOperating}{" "}
            years operating across Australia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Find a Job
            </Link>
            <Link
              href="/employers/register-vacancy"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Hire Talent
            </Link>
          </div>
        </div>
        <div
          className="relative hidden lg:flex lg:items-center lg:justify-center animate-slide-in-right"
          style={{ animationDelay: "150ms" }}
          aria-hidden="true"
        >
          {/* Waterhole rings — Aboriginal meeting-place/waterhole motif */}
          {([380, 330, 280, 228, 180] as const).map((size, i) => (
            <div
              key={size}
              className="absolute rounded-full animate-waterhole"
              style={{
                width: size,
                height: size,
                border: `${i % 2 === 0 ? "1.5px" : "1px"} solid ${
                  i % 2 === 0
                    ? "rgba(212,150,12,0.18)"
                    : "rgba(200,115,32,0.13)"
                }`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
          <div className="relative z-10 rounded-full p-2 ring-4 ring-accent/30 shadow-[0_0_60px_20px_rgba(0,0,0,0.25)] animate-float">
            <IlloraLogo className="w-80 h-80" />
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-accent/10 to-transparent"
      />

      {/* Journey-path dots — Aboriginal travel / country connection motif */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center" aria-hidden="true">
        <svg width="700" height="22" viewBox="0 0 700 22" preserveAspectRatio="xMidYMid meet">
          <path
            d="M0 11 C58 3 116 19 175 11 C233 3 291 19 350 11 C408 3 466 19 525 11 C583 3 641 19 700 11"
            stroke="rgba(212,150,12,0.28)"
            strokeWidth="1.5"
            fill="none"
          />
          {[0, 87, 175, 262, 350, 437, 525, 612, 700].map((x) => (
            <circle key={x} cx={x} cy={11} r={3} fill="rgba(200,115,32,0.4)" />
          ))}
        </svg>
      </div>
    </section>
  );
}
