"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";

import {
  CHAT_QUICK_ACTIONS,
  getReplyByKey,
  matchReply,
  type ChatLink,
} from "@/lib/chatbot";

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  links?: ChatLink[];
};

const GREETING: Message = {
  id: "greeting",
  from: "bot",
  text: "Hi, I'm the Illora Assistant. I can help you find jobs, submit your CV, get in touch with our team, or answer questions about visas and work rights.",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ChatBubble({ message }: { message: Message }) {
  const isBot = message.from === "bot";
  return (
    <div className={isBot ? "flex justify-start" : "flex justify-end"}>
      <div
        className={
          isBot
            ? "max-w-[85%] rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-sm"
            : "max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
        }
      >
        <p className="leading-relaxed">{message.text}</p>
        {message.links && message.links.length > 0 && (
          <div className="mt-2 flex flex-col items-start gap-1">
            {message.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-xs font-medium text-primary underline underline-offset-2 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function appendBotReply(text: string, links?: ChatLink[]) {
    setMessages((prev) => [...prev, { id: makeId(), from: "bot", text, links }]);
  }

  function handleQuickAction(key: string) {
    const action = CHAT_QUICK_ACTIONS.find((a) => a.key === key);
    if (!action) return;
    setMessages((prev) => [...prev, { id: makeId(), from: "user", text: action.label }]);
    const reply = getReplyByKey(key);
    window.setTimeout(() => appendBotReply(reply.text, reply.links), 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: makeId(), from: "user", text }]);
    setInput("");
    const reply = matchReply(text);
    window.setTimeout(() => appendBotReply(reply.text, reply.links), 250);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div
          role="dialog"
          aria-label="Illora Assistant chat"
          className="mb-3 flex h-[28rem] w-[90vw] max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <p className="text-sm font-semibold">Illora Assistant</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 hover:bg-primary-foreground/10"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>

          <div className="border-t border-border px-3 py-2">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {CHAT_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => handleQuickAction(action.key)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <label htmlFor="chatbot-input" className="sr-only">
                Type your message
              </label>
              <input
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="flex items-center justify-center rounded-lg bg-accent px-3 text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
                disabled={!input.trim()}
              >
                <SendIcon className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors"
      >
        {open ? (
          <XIcon className="size-5" aria-hidden="true" />
        ) : (
          <MessageCircleIcon className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
