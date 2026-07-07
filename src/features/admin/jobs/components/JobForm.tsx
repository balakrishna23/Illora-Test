"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { AU_STATES, JOB_INDUSTRIES, JOB_TYPES } from "@/lib/job-constants";
import { createJob, updateJob, type JobFormState } from "@/features/admin/jobs/actions";
import type { AdminJob } from "@/features/admin/jobs/queries";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

type Props = {
  job?: AdminJob;
};

export function JobForm({ job }: Props) {
  const action = job ? updateJob.bind(null, job.id) : createJob;
  const [state, formAction, isPending] = useActionState<JobFormState | null, FormData>(
    action,
    null
  );

  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      {state?.success === false && (
        <div
          className="sm:col-span-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
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
        <Input id="title" name="title" defaultValue={job?.title} className="mt-1" required />
        <FieldError errors={fieldErrors.title} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" name="slug" defaultValue={job?.slug} className="mt-1" required />
        <FieldError errors={fieldErrors.slug} />
      </div>
      <div>
        <Label htmlFor="location">Location *</Label>
        <Input id="location" name="location" defaultValue={job?.location} className="mt-1" required />
        <FieldError errors={fieldErrors.location} />
      </div>
      <div>
        <Label htmlFor="state">State *</Label>
        <Select id="state" name="state" defaultValue={job?.state ?? ""} className="mt-1" required>
          <option value="">Select…</option>
          {AU_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <FieldError errors={fieldErrors.state} />
      </div>
      <div>
        <Label htmlFor="latitude">Latitude *</Label>
        <Input id="latitude" name="latitude" type="number" step="any" defaultValue={job?.latitude} className="mt-1" required />
        <FieldError errors={fieldErrors.latitude} />
      </div>
      <div>
        <Label htmlFor="longitude">Longitude *</Label>
        <Input id="longitude" name="longitude" type="number" step="any" defaultValue={job?.longitude} className="mt-1" required />
        <FieldError errors={fieldErrors.longitude} />
      </div>
      <div>
        <Label htmlFor="type">Type *</Label>
        <Select id="type" name="type" defaultValue={job?.type ?? ""} className="mt-1" required>
          <option value="">Select…</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <FieldError errors={fieldErrors.type} />
      </div>
      <div>
        <Label htmlFor="industry">Industry *</Label>
        <Select id="industry" name="industry" defaultValue={job?.industry ?? ""} className="mt-1" required>
          <option value="">Select…</option>
          {JOB_INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </Select>
        <FieldError errors={fieldErrors.industry} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="salaryRange">Salary range (optional)</Label>
        <Input id="salaryRange" name="salaryRange" defaultValue={job?.salaryRange ?? undefined} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="postedDate">Posted date (YYYY-MM-DD) *</Label>
        <Input id="postedDate" name="postedDate" defaultValue={job?.postedDate} className="mt-1" required />
        <FieldError errors={fieldErrors.postedDate} />
      </div>
      <div>
        <Label htmlFor="closingDate">Closing date (YYYY-MM-DD) *</Label>
        <Input id="closingDate" name="closingDate" defaultValue={job?.closingDate} className="mt-1" required />
        <FieldError errors={fieldErrors.closingDate} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="referenceNumber">Reference number *</Label>
        <Input id="referenceNumber" name="referenceNumber" defaultValue={job?.referenceNumber} className="mt-1" required />
        <FieldError errors={fieldErrors.referenceNumber} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="teaser">Teaser *</Label>
        <Textarea id="teaser" name="teaser" defaultValue={job?.teaser} rows={2} className="mt-1" required />
        <FieldError errors={fieldErrors.teaser} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" defaultValue={job?.description} rows={4} className="mt-1" required />
        <FieldError errors={fieldErrors.description} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="responsibilities">Responsibilities * (one per line)</Label>
        <Textarea
          id="responsibilities"
          name="responsibilities"
          defaultValue={job?.responsibilities.join("\n")}
          rows={4}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.responsibilities} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="requirements">Requirements * (one per line)</Label>
        <Textarea
          id="requirements"
          name="requirements"
          defaultValue={job?.requirements.join("\n")}
          rows={4}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.requirements} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="benefits">Benefits * (one per line)</Label>
        <Textarea
          id="benefits"
          name="benefits"
          defaultValue={job?.benefits.join("\n")}
          rows={4}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.benefits} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? "Saving…" : job ? "Save changes" : "Create job"}
        </Button>
      </div>
    </form>
  );
}
