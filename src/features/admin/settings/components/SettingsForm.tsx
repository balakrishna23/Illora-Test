"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSiteSettings, type SettingsFormState } from "@/features/admin/settings/actions";
import type { AdminSiteSettings } from "@/features/admin/settings/queries";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function SettingsForm({ settings }: { settings: AdminSiteSettings | null }) {
  const [state, formAction, isPending] = useActionState<SettingsFormState | null, FormData>(
    updateSiteSettings,
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
          Saved — the home page will reflect these values immediately.
        </div>
      )}

      <div>
        <Label htmlFor="yearsOperating">Years operating</Label>
        <Input
          id="yearsOperating"
          name="yearsOperating"
          type="number"
          min={0}
          defaultValue={settings?.yearsOperating}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.yearsOperating} />
      </div>
      <div>
        <Label htmlFor="candidatesPlaced">Candidates placed</Label>
        <Input
          id="candidatesPlaced"
          name="candidatesPlaced"
          type="number"
          min={0}
          defaultValue={settings?.candidatesPlaced}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.candidatesPlaced} />
      </div>
      <div>
        <Label htmlFor="clientRetentionPct">Client retention (%)</Label>
        <Input
          id="clientRetentionPct"
          name="clientRetentionPct"
          type="number"
          min={0}
          max={100}
          defaultValue={settings?.clientRetentionPct}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.clientRetentionPct} />
      </div>
      <div>
        <Label htmlFor="activeEmployers">Active employers</Label>
        <Input
          id="activeEmployers"
          name="activeEmployers"
          type="number"
          min={0}
          defaultValue={settings?.activeEmployers}
          className="mt-1"
          required
        />
        <FieldError errors={fieldErrors.activeEmployers} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
