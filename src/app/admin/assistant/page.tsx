import type { Metadata } from "next";

import { AssistantChat } from "@/features/admin/assistant/components/AssistantChat";

export const metadata: Metadata = {
  title: "Admin — Assistant",
  robots: { index: false, follow: false },
};

export default function AdminAssistantPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Assistant</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask natural-language questions about site data. Runs read-only queries only.
      </p>
      <div className="mt-4">
        <AssistantChat />
      </div>
    </div>
  );
}
