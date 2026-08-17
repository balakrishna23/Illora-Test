import type { Metadata } from "next";

import { SignInForm } from "@/features/auth/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: "/sign-in" },
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url: redirectTo } = await searchParams;

  return (
    <div className="flex justify-center px-4 py-16">
      <SignInForm redirectTo={redirectTo} />
    </div>
  );
}
