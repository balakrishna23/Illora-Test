import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth/session";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/messages/contact", label: "Messages" },
  { href: "/admin/messages/vacancies", label: "Vacancy Requests" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/assistant", label: "Assistant" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session.success) {
    redirect("/");
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
