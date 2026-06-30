import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { VacancyForm } from "@/features/employers/components/VacancyForm";

export const metadata: Metadata = {
  title: "Register a Vacancy",
  description: "Register a vacancy with Illora. A consultant will respond within one business day.",
};

export default function RegisterVacancyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "For Employers", href: "/employers" },
          { label: "Register a Vacancy", href: "/employers/register-vacancy" },
        ]}
      />
      <div className="mt-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">For Employers</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Register a Vacancy</h1>
        <p className="mt-3 text-muted-foreground">
          Tell us about the role. The more detail you give us, the faster and
          more accurately we can source. A consultant will be in touch within one
          business day.
        </p>
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <VacancyForm />
      </div>
    </div>
  );
}
