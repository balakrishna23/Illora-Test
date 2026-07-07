"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react";

import {
  BOT_NAME,
  BOT_SUBTITLE,
  CHAT_QUICK_ACTIONS,
  getReplyByKey,
  matchReply,
  type ChatLink,
} from "@/lib/chatbot";
import { IlloraLogo } from "@/components/shared/IlloraLogo";

type Message = {
  id: string;
  from: "bot" | "user";
  text: string;
  links?: ChatLink[];
};

const GREETING: Message = {
  id: "greeting",
  from: "bot",
  text: `G'day! I'm ${BOT_NAME}, your guide here at Illoura Services. Whether you're hunting for a new role, looking to hire great talent, or just have a question — I'm here to help. What can I do for ya today?`,
};

function makeId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function JarrahAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const dim = size === "md" ? "h-9 w-9" : "h-7 w-7";
  return (
    <div className={`${dim} shrink-0 overflow-hidden rounded-full bg-[#FBF6EE] ring-2 ring-primary/20`}>
      <IlloraLogo className="h-full w-full" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <JarrahAvatar />
      <div className="rounded-xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isBot = message.from === "bot";
  return (
    <div className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && <JarrahAvatar />}
      <div
        className={
          isBot
            ? "max-w-[82%] rounded-xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-sm"
            : "max-w-[82%] rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
        }
      >
        <p className="leading-relaxed">{message.text}</p>
        {message.links && message.links.length > 0 && (
          <div className="mt-2.5 flex flex-col items-start gap-1.5">
            {message.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") || link.href.startsWith("mailto") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-xs font-semibold text-accent underline underline-offset-2 hover:opacity-75 transition-opacity"
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
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  function openChat() {
    setOpen(true);
    setHasOpened(true);
  }

  function appendBotReply(text: string, links?: ChatLink[]) {
    setIsTyping(false);
    setMessages((prev) => [...prev, { id: makeId(), from: "bot", text, links }]);
  }

  function handleQuickAction(key: string) {
    const action = CHAT_QUICK_ACTIONS.find((a) => a.key === key);
    if (!action) return;
    setMessages((prev) => [...prev, { id: makeId(), from: "user", text: action.label }]);
    setIsTyping(true);
    const reply = getReplyByKey(key);
    window.setTimeout(() => appendBotReply(reply.text, reply.links), 800);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    setMessages((prev) => [...prev, { id: makeId(), from: "user", text }]);
    setInput("");
    setIsTyping(true);
    const reply = matchReply(text);
    window.setTimeout(() => appendBotReply(reply.text, reply.links), 950);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div
          role="dialog"
          aria-label={`${BOT_NAME} — Illoura Services chat assistant`}
          className="mb-3 flex h-136 w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <JarrahAvatar size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">{BOT_NAME}</p>
              <p className="text-[11px] text-primary-foreground/65 leading-tight mt-0.5">{BOT_SUBTITLE}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-primary-foreground/65 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                Online
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 hover:bg-white/10 transition-colors"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Quick actions */}
          <div className="border-t border-border bg-muted/30 px-3 pt-2.5 pb-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Quick options
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CHAT_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => handleQuickAction(action.key)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <label htmlFor="jarrah-input" className="sr-only">
                Type your message
              </label>
              <input
                id="jarrah-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${BOT_NAME} anything…`}
                autoComplete="off"
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isTyping}
                className="flex items-center justify-center rounded-xl bg-accent px-3.5 text-accent-foreground transition-colors hover:bg-accent/85 disabled:opacity-40"
              >
                <SendIcon className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        type="button"
        onClick={open ? () => setOpen(false) : openChat}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Chat with ${BOT_NAME}`}
        className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
      >
        {open ? (
          <XIcon className="size-5" aria-hidden="true" />
        ) : (
          <>
            <MessageCircleIcon className="size-6" aria-hidden="true" />
            {!hasOpened && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow"
              >
                1
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
