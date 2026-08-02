"use client";

import { useActionState, useState } from "react";
import { CheckCircleIcon, PaperclipIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  getCampaignAttachmentUploadUrl,
  submitCampaign,
} from "@/features/admin/campaigns/actions";
import type { AudienceCounts, SubmitCampaignState } from "@/features/admin/campaigns/types";
import { JOB_INDUSTRIES } from "@/lib/job-constants";

const AUDIENCE_OPTIONS = [
  { value: "candidates", label: "All candidates" },
  ...JOB_INDUSTRIES.map((industry) => ({
    value: `candidates:${industry}` as const,
    label: `Candidates — ${industry}`,
  })),
  { value: "clients", label: "Clients (employers)" },
  { value: "general", label: "Website enquiries (contact form)" },
  { value: "all", label: "All contacts" },
] as const;

const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

type AttachmentStatus = "idle" | "uploading" | "done" | "error" | "too-large";

function AttachmentField() {
  const [status, setStatus] = useState<AttachmentStatus>("idle");
  const [filename, setFilename] = useState("");
  const [key, setKey] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > ATTACHMENT_MAX_BYTES) {
      setStatus("too-large");
      return;
    }
    setStatus("uploading");
    setFilename(file.name);
    try {
      const { uploadUrl, key: uploadedKey } = await getCampaignAttachmentUploadUrl(
        file.name,
        file.type
      );
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setKey(uploadedKey);
      setStatus("done");
    } catch (error) {
      console.error("Campaign attachment upload failed", error);
      setStatus("error");
    }
  }

  return (
    <div>
      <Label>Attachment (optional)</Label>
      <div className="mt-1 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
          <PaperclipIcon className="size-4" aria-hidden="true" />
          {status === "done" ? filename : "Attach a file (max 10 MB)"}
          <input type="file" className="sr-only" onChange={handleChange} />
        </label>
        {status === "uploading" && <span className="text-xs text-muted-foreground">Uploading…</span>}
        {status === "done" && <CheckCircleIcon className="size-4 text-green-600" aria-hidden="true" />}
        {status === "too-large" && (
          <span className="text-xs text-destructive">File is over 10 MB — choose a smaller file</span>
        )}
        {status === "error" && <span className="text-xs text-destructive">Upload failed — try again</span>}
      </div>
      <input type="hidden" name="attachmentStorageKey" value={key} />
      <input type="hidden" name="attachmentFilename" value={status === "done" ? filename : ""} />
    </div>
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
        <Label htmlFor="campaign-reply-to">Reply-to (optional)</Label>
        <Input
          id="campaign-reply-to"
          name="replyTo"
          type="email"
          placeholder="consultant@illouraservices.com"
          className="mt-1"
          aria-describedby="campaign-reply-to-error"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Replies go here instead of the sending address. Leave blank to use the default.
        </p>
        <FieldError id="campaign-reply-to-error" errors={fieldErrors.replyTo} />
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

      <AttachmentField />

      <div className="flex items-center gap-2">
        <input
          id="campaign-include-signature"
          name="includeSignature"
          type="checkbox"
          className="size-4"
          defaultChecked
        />
        <Label htmlFor="campaign-include-signature">
          Append the shared signature (edit it below)
        </Label>
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
