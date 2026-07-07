import type { Metadata } from "next";

import { getAllVacancyRequests } from "@/features/admin/messages/queries";
import { VacancyRequestStatusSelect } from "@/features/admin/messages/components/VacancyRequestStatusSelect";

export const metadata: Metadata = {
  title: "Admin — Vacancy Requests",
};

export default async function AdminVacancyRequestsPage() {
  const requests = await getAllVacancyRequests();

  return (
    <div>
      <h2 className="text-xl font-semibold">Vacancy requests ({requests.length})</h2>

      <div className="mt-4 grid gap-3">
        {requests.map((request) => (
          <div key={request.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {request.roleTitle} <span className="text-muted-foreground">— {request.companyName}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.contactName} · {request.email} · {request.phone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {request.industry} · {request.employmentType} · {request.location} · {request.urgency}
                </p>
              </div>
              <VacancyRequestStatusSelect id={request.id} status={request.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{request.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
