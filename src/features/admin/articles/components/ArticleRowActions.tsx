"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteArticle } from "@/features/admin/articles/actions";

export function ArticleRowActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this article permanently? This cannot be undone.")) {
          startTransition(async () => {
            await deleteArticle(id);
          });
        }
      }}
    >
      Delete
    </Button>
  );
}
