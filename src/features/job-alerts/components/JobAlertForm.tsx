"use client";

import { useActionState } from "react";
import { BellIcon, CheckCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { HoneypotField } from "@/components/shared/HoneypotField";
import { AU_STATES, JOB_INDUSTRIES, JOB_TYPES } from "@/lib/job-constants";
import { subscribeToJobAlert } from "@/features/job-alerts/actions";
import type { CreateJobAlertState } from "@/features/job-alerts/types";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function JobAlertForm({ defaultIndustry }: { defaultIndustry?: string }) {
  const [state, action, isPending] = useActionState<CreateJobAlertState | null, FormData>(
    subscribeToJobAlert,
    null
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCircleIcon className="size-8 text-green-600" aria-hidden="true" />
        <p className="text-sm font-medium">You&apos;re subscribed</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          We&apos;ll email you when a matching role is posted. You can unsubscribe anytime from that email.
        </p>
      </div>
    );
  }

  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-4">
      <HoneypotField />
      <div className="flex items-center gap-2 text-sm font-semibold">
        <BellIcon className="size-4" aria-hidden="true" />
        Get alerted to new roles
      </div>
      <div>
        <Label htmlFor="job-alert-email">Email *</Label>
        <Input id="job-alert-email" name="email" type="email" className="mt-1" required />
        <FieldError errors={fieldErrors.email} />
      </div>
      <div>
        <Label htmlFor="job-alert-industry">Industry</Label>
        <Select
          id="job-alert-industry"
          name="industry"
          className="mt-1"
          defaultValue={defaultIndustry ?? ""}
        >
          <option value="">Any industry</option>
          {JOB_INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="job-alert-state">State</Label>
        <Select id="job-alert-state" name="state" className="mt-1" defaultValue="">
          <option value="">Any state</option>
          {AU_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="job-alert-type">Job type</Label>
        <Select id="job-alert-type" name="jobType" className="mt-1" defaultValue="">
          <option value="">Any type</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="job-alert-keyword">Keyword (optional)</Label>
        <Input id="job-alert-keyword" name="keyword" className="mt-1" />
      </div>
      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? "Subscribing…" : "Subscribe to alerts"}
      </Button>
    </form>
  );
}
