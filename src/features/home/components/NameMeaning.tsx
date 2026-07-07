import { Reveal } from "@/components/shared/Reveal";
import { IlloraLogo } from "@/components/shared/IlloraLogo";

export function NameMeaning() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal animation="slide-in-left">
            <div className="flex items-center justify-center lg:justify-end">
              <IlloraLogo className="h-52 w-52 rounded-full shadow-md ring-4 ring-accent/20 sm:h-60 sm:w-60" />
            </div>
          </Reveal>

          <Reveal animation="slide-in-right" delay={100}>
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium uppercase tracking-widest text-accent">
                Behind the Name
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Illora
                <span className="mt-1 block text-xl font-medium italic text-accent">
                  a pleasant place
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground lg:max-w-none">
                Our name comes from <em>illoura</em>, an Aboriginal word
                recorded as meaning <em>a pleasant place</em> — a good camping
                ground, with water and plenty of food. A place people came to
                because they knew they would be looked after.
              </p>
              <p className="mt-3 max-w-xl text-muted-foreground lg:max-w-none">
                That&apos;s what we set out to build: good ground for the people
                who trust us with their careers, and for the employers who
                trust us with their teams. Everyone who comes through Illora
                should leave better off for it.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
