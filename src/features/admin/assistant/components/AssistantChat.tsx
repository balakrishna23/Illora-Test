"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SendIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { askAdminAssistant } from "@/features/admin/assistant/actions";

type Message = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "illoura-admin-assistant-messages";

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore on mount. sessionStorage isn't available during SSR, so this can't
  // be a lazy useState initializer without a hydration mismatch — it has to
  // read after mount, which means an unavoidable one-time setState-in-effect.
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (messages.length > 0) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function ask() {
    const question = input.trim();
    if (!question || isPending) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    startTransition(async () => {
      const result = await askAdminAssistant(question);
      const text = result.success ? result.answer : `Error: ${result.error}`;
      setMessages((prev) => [...prev, { role: "assistant", text }]);
    });
  }

  return (
    <div className="flex h-96 max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask a question about jobs, applications, alerts, or messages.
          </p>
        ) : (
          messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm whitespace-pre-wrap"
                }
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {isPending && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border px-3 pb-3 pt-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            placeholder="e.g. How many applications came in this week?"
            disabled={isPending}
          />
          <Button type="button" onClick={ask} disabled={isPending || !input.trim()}>
            <SendIcon aria-hidden="true" />
            Ask
          </Button>
        </div>
      </div>
    </div>
  );
}
