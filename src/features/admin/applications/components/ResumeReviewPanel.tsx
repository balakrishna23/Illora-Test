"use client";

import { useState, useTransition } from "react";
import { SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { reviewResumeWithAi } from "@/features/admin/applications/actions";
import type { ResumeReview } from "@/server/integrations/resume-parser";

type ReviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; review: ResumeReview };

function ReviewList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ResumeReviewPanel({
  applicationId,
  candidateName,
}: {
  applicationId: string;
  candidateName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ReviewState>({ status: "idle" });
  const [, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen || state.status !== "idle") return;

    setState({ status: "loading" });
    startTransition(async () => {
      const result = await reviewResumeWithAi(applicationId);
      setState(
        result.success
          ? { status: "done", review: result.review }
          : { status: "error", message: result.error }
      );
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <SparklesIcon aria-hidden="true" />
        Review with AI
      </SheetTrigger>

      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>AI resume review</SheetTitle>
          <SheetDescription>{candidateName}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4 pb-4">
          {state.status === "loading" && (
            <p className="text-sm text-muted-foreground">Reading the resume…</p>
          )}
          {state.status === "error" && (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          )}
          {state.status === "done" && (
            <>
              <p className="text-sm">{state.review.summary}</p>
              <ReviewList title="Strengths" items={state.review.strengths} />
              <ReviewList title="Concerns" items={state.review.concerns} />
              <ReviewList
                title="Suggested interview questions"
                items={state.review.suggestedInterviewQuestions}
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
