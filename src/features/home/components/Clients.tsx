import Image from "next/image";
import { LandmarkIcon, BadgeCheckIcon } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { logoUrl } from "@/server/lib/logos";

// Government departments are named as TEXT only — never the Commonwealth Coat
// of Arms, which is legally protected and must not be reproduced as a client
// logo without authorisation. Confirm any contract confidentiality terms before
// publishing these names. Private clients may use a logo (public/logos/).
const GOVERNMENT_CLIENTS = [
  { name: "Department of Home Affairs", tier: "Australian Government" },
];

const PRIVATE_CLIENTS = [{ logo: "coforge.jpeg", name: "Coforge" }];

export function Clients() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal animation="fade-in-up">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              Who we work with
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Trusted across government and industry
            </h2>
            <p className="mt-3 text-muted-foreground">
              We deliver recruitment and workforce solutions to Australian
              Government departments and private enterprise alike.
            </p>
          </div>
        </Reveal>

        {/* Government — the flagship trust signal, given a bolder treatment */}
        <Reveal animation="fade-in-up">
          <div className="mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/10 px-6 py-3">
              <LandmarkIcon className="size-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold tracking-wide text-primary">
                Trusted by Australian Government departments
              </p>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {GOVERNMENT_CLIENTS.map((client) => (
                <div key={client.name} className="flex items-start gap-3 bg-card px-6 py-6">
                  <BadgeCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {client.tier}
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-foreground">{client.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Private sector */}
        <Reveal animation="fade-in-up" delay={80}>
          <div className="mt-8">
            <p className="text-sm font-semibold text-muted-foreground">Private sector</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {PRIVATE_CLIENTS.map((client) => {
                const src = logoUrl(client.logo);
                return (
                  <div
                    key={client.name}
                    className="flex h-full items-center justify-center rounded-xl border border-border bg-card px-5 py-6"
                  >
                    {src ? (
                      <div className="relative h-9 w-full">
                        <Image src={src} alt={client.name} fill className="object-contain" sizes="240px" />
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
