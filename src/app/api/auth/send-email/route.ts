import { NextResponse } from "next/server";

import { verifyStandardWebhook, WebhookVerificationError } from "@/server/auth/verify-webhook";
import { sendAuthHookEmail, type SendEmailHookPayload } from "@/server/integrations/resend";

// Supabase Auth "Send Email" hook target. Replaces GoTrue's built-in SMTP
// relay (which proved unreliable — see DEPLOYMENT.md) with a direct call to
// Resend's HTTP API for every auth email (signup confirmation, email change,
// etc). Configured in Supabase Dashboard -> Authentication -> Hooks ->
// "Send Email" hook, pointed at this route's public URL; Supabase generates
// the signing secret shown there, which goes in SEND_EMAIL_HOOK_SECRET.
export async function POST(request: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret) {
    console.error("send-email hook: SEND_EMAIL_HOOK_SECRET is not set");
    return NextResponse.json(
      { error: { http_code: 500, message: "Hook not configured" } },
      { status: 500 }
    );
  }

  const body = await request.text();

  try {
    verifyStandardWebhook({
      secret,
      id: request.headers.get("svix-id"),
      timestamp: request.headers.get("svix-timestamp"),
      signature: request.headers.get("svix-signature"),
      body,
    });
  } catch (error) {
    const message = error instanceof WebhookVerificationError ? error.message : "Verification failed";
    console.error("send-email hook: signature verification failed", message);
    return NextResponse.json({ error: { http_code: 401, message } }, { status: 401 });
  }

  let payload: SendEmailHookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    console.error("send-email hook: request body was not valid JSON");
    return NextResponse.json(
      { error: { http_code: 400, message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  try {
    await sendAuthHookEmail(payload);
  } catch (error) {
    // Logged with the action type for triage — this is now the one place
    // that will show the *real* Resend error for an auth-email failure,
    // instead of it being swallowed inside Supabase's own infrastructure.
    console.error("send-email hook: failed to send", payload.email_data?.email_action_type, error);
    return NextResponse.json(
      { error: { http_code: 500, message: "Email send failed" } },
      { status: 500 }
    );
  }

  return NextResponse.json({});
}
