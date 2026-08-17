import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center px-4 py-16">
      <ForgotPasswordForm />
    </div>
  );
}
