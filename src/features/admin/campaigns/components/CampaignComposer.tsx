"use client";

import { useActionState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { submitCampaign } from "@/features/admin/campaigns/actions";
import type { AudienceCounts, SubmitCampaignState } from "@/features/admin/campaigns/types";

const AUDIENCE_OPTIONS = [
  { value: "candidates", label: "Candidates" },
  { value: "clients", label: "Clients (employers)" },
  { value: "all", label: "All contacts" },
] as const;

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function CampaignComposer({ audienceCounts }: { audienceCounts: AudienceCounts }) {
  const [state, action, isPending] = useActionState<SubmitCampaignState, FormData>(
    submitCampaign,
    null
  );
  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-border bg-card p-5">
      {state && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${state.success ? "bg-green-50 text-green-800" : "bg-destructive/10 text-destructive"}`}
        >
          {state.success ? (
            <CheckCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <XCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          )}
          {state.success ? state.message : state.error}
        </p>
      )}

      <div>
        <Label htmlFor="campaign-audience">Audience</Label>
        <Select id="campaign-audience" name="audience" className="mt-1" defaultValue="candidates">
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} — {audienceCounts[option.value]} recipient
              {audienceCounts[option.value] === 1 ? "" : "s"}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="campaign-subject">Subject *</Label>
        <Input
          id="campaign-subject"
          name="subject"
          className="mt-1"
          required
          maxLength={200}
          aria-describedby="campaign-subject-error"
        />
        <FieldError id="campaign-subject-error" errors={fieldErrors.subject} />
      </div>

      <div>
        <Label htmlFor="campaign-body">Message *</Label>
        <Textarea
          id="campaign-body"
          name="body"
          className="mt-1 min-h-48"
          required
          aria-describedby="campaign-body-hint campaign-body-error"
        />
        <p id="campaign-body-hint" className="mt-1 text-xs text-muted-foreground">
          Use {"{{name}}"} and {"{{company}}"} to personalise — they fall back to
          &ldquo;there&rdquo; and &ldquo;your company&rdquo;. An unsubscribe link is added
          automatically.
        </p>
        <FieldError id="campaign-body-error" errors={fieldErrors.body} />
      </div>

      <div className="flex items-center gap-2">
        <input id="campaign-confirm" name="confirm" type="checkbox" className="size-4" />
        <Label htmlFor="campaign-confirm">
          I&apos;ve reviewed a test email and want to send this to the full audience
        </Label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="test" variant="outline" disabled={isPending}>
          {isPending ? "Working…" : "Send test to my email"}
        </Button>
        <Button type="submit" name="intent" value="send" variant="accent" disabled={isPending}>
          {isPending ? "Working…" : "Send campaign"}
        </Button>
      </div>
    </form>
  );
}
