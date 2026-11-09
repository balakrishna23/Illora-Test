import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminEmail, requireUser } from "@/server/auth/session";

// Every route under here reads cookies and calls Supabase Auth — never
// prerenderable. Without this, Next attempts to execute that auth/DB work
// during the build's static-generation pass, which hangs if the build
// host's network can't reach Supabase and takes the whole build down with it.
export const dynamic = "force-dynamic";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/messages/contact", label: "Messages" },
  { href: "/admin/messages/vacancies", label: "Vacancy Requests" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/assistant", label: "Assistant" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  if (!session.success) {
    redirect("/sign-in?redirect_url=/admin");
  }

  if (!isAdminEmail(session.email)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              You are signed in as <span className="font-medium text-foreground">{session.email}</span>,
              but that account is not allowed to open the admin portal.
            </p>
            <p>
              Add this email to <code>ADMIN_EMAILS</code> or include its domain in <code>ADMIN_DOMAINS</code>,
              then try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <nav aria-label="Admin" className="mt-6 flex flex-wrap gap-1 border-b border-border pb-2">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
