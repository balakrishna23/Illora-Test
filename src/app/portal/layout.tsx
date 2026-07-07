import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/portal");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">My Portal</h1>
      <p className="mt-2 text-muted-foreground">Your saved jobs and application status.</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
