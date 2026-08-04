import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/server/auth/session";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  if (!session.success) {
    redirect("/sign-in?redirect_url=/portal");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Portal</h1>
          <p className="mt-2 text-muted-foreground">Your saved jobs and application status.</p>
        </div>
        <Link href="/portal/account" className="text-sm text-primary hover:underline">
          Account settings
        </Link>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
