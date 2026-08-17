import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth/components/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up",
  alternates: { canonical: "/sign-up" },
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="flex justify-center px-4 py-16">
      <SignUpForm />
    </div>
  );
}
