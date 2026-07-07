import type { Metadata } from "next";

import { getAllContactMessages } from "@/features/admin/messages/queries";
import { ContactMessageStatusSelect } from "@/features/admin/messages/components/ContactMessageStatusSelect";

export const metadata: Metadata = {
  title: "Admin — Contact Messages",
};

export default async function AdminContactMessagesPage() {
  const messages = await getAllContactMessages();

  return (
    <div>
      <h2 className="text-xl font-semibold">Contact messages ({messages.length})</h2>

      <div className="mt-4 grid gap-3">
        {messages.map((message) => (
          <div key={message.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">
                  {message.name} <span className="text-muted-foreground">— {message.subject}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {message.email} {message.phone && `· ${message.phone}`}
                </p>
              </div>
              <ContactMessageStatusSelect id={message.id} status={message.status} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{message.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
