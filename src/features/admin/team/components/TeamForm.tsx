"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createTeamMember, updateTeamMember, type TeamFormState } from "@/features/admin/team/actions";
import type { AdminTeamMember } from "@/features/admin/team/queries";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

export function TeamForm({ member }: { member?: AdminTeamMember }) {
  const action = member ? updateTeamMember.bind(null, member.id) : createTeamMember;
  const [state, formAction, isPending] = useActionState<TeamFormState | null, FormData>(
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

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" defaultValue={member?.name} className="mt-1" required />
        <FieldError errors={fieldErrors.name} />
      </div>
      <div>
        <Label htmlFor="role">Role *</Label>
        <Input id="role" name="role" defaultValue={member?.role} className="mt-1" required />
        <FieldError errors={fieldErrors.role} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="culturalConnection">Cultural connection (optional)</Label>
        <Input
          id="culturalConnection"
          name="culturalConnection"
          defaultValue={member?.culturalConnection ?? undefined}
          className="mt-1"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="bio">Bio *</Label>
        <Textarea id="bio" name="bio" defaultValue={member?.bio} rows={4} className="mt-1" required />
        <FieldError errors={fieldErrors.bio} />
      </div>
      <div>
        <Label htmlFor="linkedIn">LinkedIn URL (optional)</Label>
        <Input
          id="linkedIn"
          name="linkedIn"
          type="url"
          placeholder="https://linkedin.com/in/…"
          defaultValue={member?.linkedIn ?? undefined}
          className="mt-1"
        />
        <FieldError errors={fieldErrors.linkedIn} />
      </div>
      <div>
        <Label htmlFor="sortOrder">Display order *</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={member?.sortOrder ?? 0}
          className="mt-1"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first.</p>
        <FieldError errors={fieldErrors.sortOrder} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? "Saving…" : member ? "Save changes" : "Add team member"}
        </Button>
      </div>
    </form>
  );
}
