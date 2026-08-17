import type { Metadata } from "next";

import { getSiteSettingsAdmin } from "@/features/admin/settings/queries";
import { SettingsForm } from "@/features/admin/settings/components/SettingsForm";

export const metadata: Metadata = {
  title: "Admin — Site Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsAdmin();

  return (
    <div>
      <h2 className="text-xl font-semibold">Site settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These numbers are shown in the homepage hero and trust strip.
      </p>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
