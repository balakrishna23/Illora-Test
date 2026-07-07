"use client";

import { useActionState } from "react";
import { CheckCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { HoneypotField } from "@/components/shared/HoneypotField";
import { registerVacancy, type VacancyFormState } from "@/features/employers/actions";
import { JOB_INDUSTRIES } from "@/lib/job-constants";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive">{errors[0]}</p>;
}

export function VacancyForm({ serviceType }: { serviceType?: string }) {
  const [state, action, isPending] = useActionState<VacancyFormState | null, FormData>(
    registerVacancy,
    null
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircleIcon className="size-12 text-green-600" aria-hidden="true" />
        <h3 className="text-xl font-semibold">Vacancy received</h3>
        <p className="max-w-sm text-muted-foreground">
          Thanks for registering your vacancy. A consultant will be in touch
          within one business day to discuss the role and next steps.
        </p>
      </div>
    );
  }

  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <HoneypotField />
      {serviceType && (
        <input type="hidden" name="serviceType" value={serviceType} />
      )}

      {state?.success === false && !Object.keys(fieldErrors).length && (
        <div className="sm:col-span-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div>
        <Label htmlFor="companyName">Company name *</Label>
        <Input id="companyName" name="companyName" className="mt-1" required />
        <FieldError errors={fieldErrors.companyName} />
      </div>
      <div>
        <Label htmlFor="contactName">Your name *</Label>
        <Input id="contactName" name="contactName" className="mt-1" required />
        <FieldError errors={fieldErrors.contactName} />
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
        <Label htmlFor="roleTitle">Role title *</Label>
        <Input id="roleTitle" name="roleTitle" className="mt-1" required />
        <FieldError errors={fieldErrors.roleTitle} />
      </div>
      <div>
        <Label htmlFor="employmentType">Employment type *</Label>
        <Select id="employmentType" name="employmentType" className="mt-1" required>
          <option value="">Select…</option>
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
          <option value="Casual">Casual</option>
        </Select>
        <FieldError errors={fieldErrors.employmentType} />
      </div>
      <div>
        <Label htmlFor="location">Location *</Label>
        <Input id="location" name="location" placeholder="e.g. Sydney, NSW" className="mt-1" required />
        <FieldError errors={fieldErrors.location} />
      </div>
      <div>
        <Label htmlFor="industry">Industry *</Label>
        <Select id="industry" name="industry" className="mt-1" required>
          <option value="">Select…</option>
          {JOB_INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </Select>
        <FieldError errors={fieldErrors.industry} />
      </div>
      <div>
        <Label htmlFor="urgency">Urgency *</Label>
        <Select id="urgency" name="urgency" className="mt-1" required>
          <option value="">Select…</option>
          <option value="ASAP">ASAP</option>
          <option value="Within 2 weeks">Within 2 weeks</option>
          <option value="Within a month">Within a month</option>
          <option value="No rush">No rush</option>
        </Select>
        <FieldError errors={fieldErrors.urgency} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message">Tell us about the role *</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1"
          placeholder="Describe the key responsibilities, must-have requirements, and any context that helps us find the right person."
          required
        />
        <FieldError errors={fieldErrors.message} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Submitting…" : "Register Vacancy"}
        </Button>
      </div>
    </form>
  );
}
