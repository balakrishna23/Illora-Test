"use client";

import { useActionState, useState } from "react";
import { CheckCircleIcon, UploadIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { submitCv, getR2UploadUrl, type SubmitCvState } from "@/features/candidates/actions";
import { JOB_INDUSTRIES } from "@/server/integrations/jobadder";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive" role="alert">{errors[0]}</p>;
}

function FileUploadField({
  label,
  name,
  required,
  onKeyChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  onKeyChange: (key: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [filename, setFilename] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setFilename(file.name);
    try {
      const { uploadUrl, key } = await getR2UploadUrl(file.name, file.type);
      // In production: await fetch(uploadUrl, { method: "PUT", body: file });
      void uploadUrl;
      onKeyChange(key);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <Label>
        {label} {required && <span aria-hidden="true">*</span>}
      </Label>
      <div className="mt-1 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
          <UploadIcon className="size-4" aria-hidden="true" />
          {status === "done" ? filename : "Choose file (PDF or DOCX, max 5 MB)"}
          <input
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={handleChange}
          />
        </label>
        {status === "uploading" && <span className="text-xs text-muted-foreground">Uploading…</span>}
        {status === "done" && <CheckCircleIcon className="size-4 text-green-600" aria-hidden="true" />}
        {status === "error" && <span className="text-xs text-destructive">File too large or upload failed</span>}
      </div>
      <input type="hidden" name={name} value={status === "done" ? filename : ""} />
    </div>
  );
}

export function SubmitCvForm() {
  const [resumeKey, setResumeKey] = useState("");
  const [coverKey, setCoverKey] = useState("");

  const [state, action, isPending] = useActionState<SubmitCvState | null, FormData>(
    submitCv,
    null
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircleIcon className="size-12 text-green-600" aria-hidden="true" />
        <h2 className="text-xl font-semibold">CV received — thank you</h2>
        <p className="max-w-sm text-muted-foreground">
          A consultant will review your submission and be in touch within two
          business days, whether we have an immediate match or not.
        </p>
      </div>
    );
  }

  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="resumeKey" value={resumeKey} />
      <input type="hidden" name="coverLetterKey" value={coverKey} />

      {state?.success === false && (
        <div className="sm:col-span-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="name">Full name *</Label>
        <Input id="name" name="name" className="mt-1" required />
        <FieldError errors={fieldErrors.name} />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" className="mt-1" required />
        <FieldError errors={fieldErrors.email} />
      </div>
      <div>
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" name="phone" type="tel" className="mt-1" required />
        <FieldError errors={fieldErrors.phone} />
      </div>
      <div>
        <Label htmlFor="targetIndustry">Target industry *</Label>
        <Select id="targetIndustry" name="targetIndustry" className="mt-1" required>
          <option value="">Select…</option>
          {JOB_INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </Select>
        <FieldError errors={fieldErrors.targetIndustry} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="currentRole">Current role / title *</Label>
        <Input id="currentRole" name="currentRole" className="mt-1" required />
        <FieldError errors={fieldErrors.currentRole} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="linkedIn">LinkedIn URL (optional)</Label>
        <Input id="linkedIn" name="linkedIn" type="url" placeholder="https://linkedin.com/in/…" className="mt-1" />
        <FieldError errors={fieldErrors.linkedIn} />
      </div>

      <div className="sm:col-span-2">
        <FileUploadField
          label="Resume"
          name="resumeKey"
          required
          onKeyChange={setResumeKey}
        />
        <FieldError errors={fieldErrors.resumeKey} />
      </div>
      <div className="sm:col-span-2">
        <FileUploadField
          label="Cover letter (optional)"
          name="coverLetterKey"
          onKeyChange={setCoverKey}
        />
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 rounded border-border"
            required
            aria-describedby="consent-desc"
          />
          <span id="consent-desc" className="text-sm text-muted-foreground">
            I consent to Illora storing and using my information for recruitment
            purposes in accordance with the{" "}
            <a href="/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            . *
          </span>
        </label>
        <FieldError errors={fieldErrors.consent} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending || !resumeKey}>
          {isPending ? "Submitting…" : "Submit CV"}
        </Button>
      </div>
    </form>
  );
}
