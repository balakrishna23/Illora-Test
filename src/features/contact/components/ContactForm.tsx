"use client";

import { useActionState } from "react";
import { CheckCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { HoneypotField } from "@/components/shared/HoneypotField";
import { sendContactMessage, type ContactFormState } from "@/features/contact/actions";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-destructive" role="alert">{errors[0]}</p>;
}

export function ContactForm() {
  const [state, action, isPending] = useActionState<ContactFormState | null, FormData>(
    sendContactMessage,
    null
  );

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircleIcon className="size-12 text-green-600" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Message received</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          We&apos;ll be in touch within one business day.
        </p>
      </div>
    );
  }

  const fieldErrors = state?.success === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <HoneypotField />
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" className="mt-1" required />
        <FieldError errors={fieldErrors.name} />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" className="mt-1" required />
        <FieldError errors={fieldErrors.email} />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Select id="subject" name="subject" className="mt-1" required>
          <option value="">Select…</option>
          <option value="General Enquiry">General Enquiry</option>
          <option value="Employer Enquiry">Employer Enquiry</option>
          <option value="Candidate Enquiry">Candidate Enquiry</option>
          <option value="Media">Media</option>
        </Select>
        <FieldError errors={fieldErrors.subject} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" name="message" rows={5} className="mt-1" required />
        <FieldError errors={fieldErrors.message} />
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="marketingConsent"
            className="mt-0.5 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">
            Keep me updated with news and insights from Illora. You can
            unsubscribe at any time. (Optional)
          </span>
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
