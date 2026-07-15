import { Reveal } from "@/components/shared/Reveal";

// Text-only by design. Government department branding uses the Commonwealth
// Coat of Arms, which is legally protected and shouldn't be reproduced as a
// client logo without authorisation — so clients are named, not badged.
// Confirm any contract confidentiality terms before publishing these names.
const GOVERNMENT_CLIENTS = [
  "Australian Government — Department of Health, Disability & Ageing",
  "Australian Government — Department of Home Affairs",
];

const PRIVATE_CLIENTS = ["Coforge"];

function ClientCard({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-card px-5 py-6 text-center">
      <p className="text-sm font-medium text-foreground">{name}</p>
    </div>
  );
}

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

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-muted-foreground">Government</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {GOVERNMENT_CLIENTS.map((name, i) => (
                <Reveal key={name} animation="fade-in-up" delay={i * 70}>
                  <ClientCard name={name} />
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Private sector</p>
            <div className="mt-3 grid gap-4">
              {PRIVATE_CLIENTS.map((name, i) => (
                <Reveal key={name} animation="fade-in-up" delay={i * 70}>
                  <ClientCard name={name} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
