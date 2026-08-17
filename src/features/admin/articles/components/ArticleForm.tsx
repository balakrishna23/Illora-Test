"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { ARTICLE_CATEGORIES } from "@/lib/article-constants";
import { createArticle, updateArticle, type ArticleFormState } from "@/features/admin/articles/actions";
import type { AdminArticle } from "@/features/admin/articles/queries";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function ArticleForm({ article }: { article?: AdminArticle }) {
  const action = article ? updateArticle.bind(null, article.id) : createArticle;
  const [state, formAction, isPending] = useActionState<ArticleFormState | null, FormData>(
    action,
    null
  );
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {state?.success === false && (
        <div className="sm:col-span-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </div>
      )}
      {state?.success === true && (
        <div className="sm:col-span-2 rounded-lg bg-green-600/10 px-4 py-3 text-sm text-green-700">
          Saved.
        </div>
      )}

      <div className="sm:col-span-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={article?.title} className="mt-1" required />
        <FieldError errors={fieldErrors.title} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" name="slug" defaultValue={article?.slug} className="mt-1" required />
        <FieldError errors={fieldErrors.slug} />
      </div>
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select id="category" name="category" defaultValue={article?.category ?? ""} className="mt-1" required>
          <option value="">Select…</option>
          {ARTICLE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <FieldError errors={fieldErrors.category} />
      </div>
      <div>
        <Label htmlFor="publishDate">Publish date (YYYY-MM-DD) *</Label>
        <Input id="publishDate" name="publishDate" defaultValue={article?.publishDate} className="mt-1" required />
        <FieldError errors={fieldErrors.publishDate} />
      </div>
      <div>
        <Label htmlFor="readingTimeMinutes">Reading time (minutes) *</Label>
        <Input
          id="readingTimeMinutes"
          name="readingTimeMinutes"
          type="number"
          min={1}
          defaultValue={article?.readingTimeMinutes}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.readingTimeMinutes} />
      </div>
      <div>
        <Label htmlFor="authorName">Author name *</Label>
        <Input id="authorName" name="authorName" defaultValue={article?.authorName} className="mt-1" required />
        <FieldError errors={fieldErrors.authorName} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="authorRole">Author role *</Label>
        <Input id="authorRole" name="authorRole" defaultValue={article?.authorRole} className="mt-1" required />
        <FieldError errors={fieldErrors.authorRole} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={article?.excerpt} rows={3} className="mt-1" required />
        <FieldError errors={fieldErrors.excerpt} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="body">Body *</Label>
        <Textarea id="body" name="body" defaultValue={article?.body} rows={16} className="mt-1" required />
        <p className="mt-1 text-xs text-muted-foreground">
          Paragraphs separated by a blank line. Wrap a line in **asterisks** to render it as a subheading.
          Use <code>![caption](/path/to/image.jpg)</code> on its own line to embed a photo — upload the file to{" "}
          <code>public/knowledge-hub/</code> first.
        </p>
        <FieldError errors={fieldErrors.body} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? "Saving…" : article ? "Save changes" : "Create article"}
        </Button>
      </div>
    </form>
  );
}
