"use client";

import { useActionState, useRef, useState } from "react";
import { CheckCircleIcon, SparklesIcon, UploadIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import {
  submitCv,
  getResumeUploadUrl,
  parseUploadedResume,
  type SubmitCvState,
} from "@/features/candidates/actions";
import { HoneypotField } from "@/components/shared/HoneypotField";
import { JOB_INDUSTRIES } from "@/lib/job-constants";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive" role="alert">{errors[0]}</p>;
}

function FileUploadField({
  label,
  required,
  onKeyChange,
}: {
  label: string;
  required?: boolean;
  onKeyChange: (key: string) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "too-large" | "error">("idle");
  const [filename, setFilename] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus("too-large");
      return;
    }
    setStatus("uploading");
    setFilename(file.name);
    try {
      const { uploadUrl, key } = await getResumeUploadUrl(file.name, file.type);
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) {
        console.error("Resume upload failed", response.status, await response.text().catch(() => ""));
        setStatus("error");
        return;
      }

      onKeyChange(key);
      setStatus("done");
    } catch (error) {
      console.error("Resume upload failed", error);
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
        {status === "too-large" && <span className="text-xs text-destructive">File is over 5 MB — please choose a smaller file</span>}
        {status === "error" && <span className="text-xs text-destructive">Upload failed — please try again</span>}
      </div>
    </div>
  );
}

type Props = {
  jobId?: string;
  jobSlug?: string;
  jobTitle?: string;
  /** Set when the signed-in candidate already has a submission on file —
   * shown as a warning that submitting again replaces it. ISO date string. */
  existingSubmittedAt?: string;
};

export function SubmitCvForm({ jobId, jobSlug, jobTitle, existingSubmittedAt }: Props) {
  const [resumeKey, setResumeKey] = useState("");
  const [autofillStatus, setAutofillStatus] = useState<"idle" | "reading" | "done" | "none">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState<SubmitCvState | null, FormData>(
    submitCv,
    null
  );

  // After a resume uploads, try to read it and pre-fill the form. Uncontrolled
  // inputs are set via the DOM (FormData reads their live value on submit).
  function setFieldValue(name: string, value?: string) {
    if (!value) return;
    const el = formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    if (!el) return;
    if (el instanceof HTMLSelectElement) {
      // Only set a select if the parsed value is an available option.
      if ([...el.options].some((o) => o.value === value)) el.value = value;
    } else {
      el.value = value;
    }
  }

  async function handleResumeUploaded(key: string) {
    setResumeKey(key);
    setAutofillStatus("reading");
    try {
      const result = await parseUploadedResume(key);
      if (result.success) {
        const d = result.data;
        setFieldValue("name", d.name);
        setFieldValue("email", d.email);
        setFieldValue("phone", d.phone);
        setFieldValue("currentRole", d.currentRole);
        setFieldValue("linkedIn", d.linkedIn);
        setFieldValue("targetIndustry", d.targetIndustry);
        setFieldValue("securityClearance", d.securityClearance);
        setAutofillStatus("done");
      } else {
        setAutofillStatus("none");
      }
    } catch {
      setAutofillStatus("none");
    }
  }

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircleIcon className="size-12 text-green-600" aria-hidden="true" />
        <h2 className="text-xl font-semibold">
          {state.replaced ? "CV updated — thank you" : "CV received — thank you"}
        </h2>
        <p className="max-w-sm text-muted-foreground">
          {state.replaced
            ? "Your previous submission has been replaced with this one. "
            : ""}
          A consultant will review your submission and be in touch within two
          business days, whether we have an immediate match or not.
        </p>
      </div>
    );
  }

  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form ref={formRef} action={action} className="grid gap-5 sm:grid-cols-2">
      <HoneypotField />
      <input type="hidden" name="resumeKey" value={resumeKey} />
      {jobId && <input type="hidden" name="jobId" value={jobId} />}
      {jobSlug && <input type="hidden" name="jobSlug" value={jobSlug} />}
      {jobTitle && <input type="hidden" name="jobTitle" value={jobTitle} />}

      {jobTitle && (
        <p className="sm:col-span-2 text-sm text-muted-foreground">
          Applying for: <span className="font-medium text-foreground">{jobTitle}</span>
        </p>
      )}

      {existingSubmittedAt && (
        <div
          className="sm:col-span-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
          role="status"
        >
          You already have a CV on file with us (submitted{" "}
          {new Date(existingSubmittedAt).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          ). Submitting this form will <strong>replace</strong> your previous
          submission — we only keep one CV per person.
        </div>
      )}

      {state?.success === false && (
        <div className="sm:col-span-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.error}
        </div>
      )}

      {/* Resume upload first — a PDF auto-fills the fields below */}
      <div className="sm:col-span-2 rounded-xl border border-accent/30 bg-accent/5 p-4">
        <FileUploadField
          label="Resume"
          required
          onKeyChange={handleResumeUploaded}
        />
        <FieldError errors={fieldErrors.resumeKey} />
        {autofillStatus === "reading" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <SparklesIcon className="size-3.5 animate-pulse text-accent" aria-hidden="true" />
            Reading your resume to pre-fill the form…
          </p>
        )}
        {autofillStatus === "done" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-green-700">
            <SparklesIcon className="size-3.5 text-accent" aria-hidden="true" />
            We pre-filled some fields from your resume — please review and correct anything.
          </p>
        )}
        {autofillStatus === "none" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Upload a PDF resume and we&apos;ll try to pre-fill the form for you.
          </p>
        )}
        {autofillStatus === "idle" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Tip: upload a PDF and we&apos;ll auto-fill your details below.
          </p>
        )}
      </div>

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
        <Label htmlFor="securityClearance">
          Australian Government security clearance
        </Label>
        <Select id="securityClearance" name="securityClearance" className="mt-1" defaultValue="None">
          <option value="None">None</option>
          <option value="Baseline">Baseline</option>
          <option value="NV1">Negative Vetting 1 (NV1)</option>
          <option value="NV2">Negative Vetting 2 (NV2)</option>
          <option value="TSPV">Top Secret Positive Vetting (TSPV)</option>
        </Select>
        <FieldError errors={fieldErrors.securityClearance} />
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
            I consent to Illoura storing and using my information for recruitment
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
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-0.5 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">
            Keep me updated with relevant roles, hiring insights, and news from
            Illoura. You can unsubscribe at any time. (Optional)
          </span>
        </label>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending || !resumeKey}>
          {isPending ? "Submitting…" : "Submit CV"}
        </Button>
      </div>
    </form>
  );
}
