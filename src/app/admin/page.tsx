import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { getAdminAnalytics } from "@/features/admin/analytics/queries";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

function StatCard({ label, value, sublabel }: { label: string; value: number; sublabel?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminAnalytics();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total accounts created" value={stats.totalAccountsCreated} />
      <StatCard label="Active jobs" value={stats.activeJobs} />
      <StatCard
        label="Applications this week"
        value={stats.applicationsThisWeek}
        sublabel={`${stats.applicationsThisMonth} this month`}
      />
      <StatCard label="Saved jobs" value={stats.savedJobsCount} />
      <StatCard
        label="Active alert subscribers"
        value={stats.alertSubscribers}
        sublabel={`+${stats.alertSubscribersLastWeek} in the last 7 days`}
      />
      <StatCard
        label="Contact messages"
        value={stats.contactMessagesTotal}
        sublabel={`${stats.contactMessagesNew} unread`}
      />
      <StatCard
        label="Vacancy requests"
        value={stats.vacancyRequestsTotal}
        sublabel={`${stats.vacancyRequestsNew} new`}
      />
    </div>
  );
}
