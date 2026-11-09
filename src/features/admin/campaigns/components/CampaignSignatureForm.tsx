"use client";

import { useActionState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  updateCampaignSignature,
  type SignatureFormState,
} from "@/features/admin/campaigns/actions";

export function CampaignSignatureForm({ signature }: { signature: string | null }) {
  const [state, formAction, isPending] = useActionState<SignatureFormState | null, FormData>(
    updateCampaignSignature,
    null
  );

  return (
    <form action={formAction} className="grid gap-3 rounded-xl border border-border bg-card p-5">
      {state?.success === false && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success === true && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">Signature saved.</p>
      )}
      <Textarea
        name="signature"
        defaultValue={signature ?? ""}
        rows={5}
        placeholder={"— The Illoura team\nillouraservices.com"}
      />
      <p className="text-xs text-muted-foreground">
        Appended to every campaign that has &ldquo;Append the shared signature&rdquo; checked.
      </p>
      <div>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save signature"}
        </Button>
      </div>
    </form>
  );
}
