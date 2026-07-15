import Image from "next/image";

import { Reveal } from "@/components/shared/Reveal";
import { logoUrl } from "@/server/lib/logos";

// Each item shows its real logo if a matching file exists in public/logos/,
// otherwise a text badge. Wording is deliberately conservative: Supply Nation
// is "Registered" (not Certified), and the networks are "Member" unless a
// formal "Certified Member" status is confirmed.
const ACCREDITATIONS = [
  { logo: "supply-nation.jpeg", abbr: "SN", name: "Supply Nation", caption: "Registered" },
  { logo: "nswicc.jpeg", abbr: "NSWICC", name: "NSW Indigenous Chamber of Commerce", caption: "Member" },
  { logo: "pibng.jpeg", abbr: "PIBNG", name: "Pilbara Indigenous Business Network Group", caption: "Member" },
  { logo: "ntibn.jpeg", abbr: "NTIBN", name: "Northern Territory Indigenous Business Network", caption: "Member" },
  { logo: "kdcci.jpeg", abbr: "KDCCI", name: "Karratha & Districts Chamber of Commerce & Industry", caption: "Member" },
];

export function Accreditations() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal animation="fade-in-up">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Accreditations &amp; Memberships
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Recognised where it matters
            </h2>
            <p className="mt-3 text-muted-foreground">
              Illora is a First Nations-owned business, Supply Nation Registered
              and an active member of Indigenous business networks and chambers
              across Australia — credentials that support government and
              corporate procurement obligations.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ACCREDITATIONS.map((item, i) => {
            const src = logoUrl(item.logo);
            return (
              <Reveal key={item.abbr} animation="fade-in-up" delay={i * 70}>
                <div className="flex h-full flex-col items-center rounded-xl border border-border bg-card p-5 text-center">
                  {src ? (
                    <div className="relative h-14 w-full">
                      <Image src={src} alt={item.name} fill className="object-contain" sizes="200px" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-extrabold tracking-tight text-primary">
                        {item.abbr}
                      </span>
                    </div>
                  )}
                  <p className="mt-3 flex-1 text-sm font-medium leading-snug text-foreground">
                    {item.name}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {item.caption}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
