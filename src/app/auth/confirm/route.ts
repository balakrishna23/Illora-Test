import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/server/auth/supabase-server";

// Mirrors Supabase's EmailOtpType — kept local rather than imported from
// @supabase/supabase-js (a transitive dep via @supabase/ssr, not a direct
// one) so this route doesn't rely on an indirect package's type surface.
const EMAIL_OTP_TYPES = ["signup", "invite", "magiclink", "recovery", "email_change", "email"] as const;
type EmailOtpType = (typeof EMAIL_OTP_TYPES)[number];

function isEmailOtpType(value: string): value is EmailOtpType {
  return (EMAIL_OTP_TYPES as readonly string[]).includes(value);
}

// Target of every auth email link sent via the Send Email Hook
// (src/server/integrations/resend.ts's sendAuthHookEmail) — signup
// confirmation, email change, and password recovery. Verifies the token
// server-side via verifyOtp(), which sets the session cookie directly, then
// redirects to `next` already authenticated. This is Supabase's documented
// pattern for @supabase/ssr apps (no browser client here to pick a session
// up from a URL hash fragment, so this has to happen server-side).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  // Only ever redirect within this site — `next` is attacker-influenceable
  // in principle (it's a URL param), even though in practice it only ever
  // comes from a redirectTo this app itself set on the original signUp/
  // resetPasswordForEmail/updateUser call.
  const safeNext = next && next.startsWith(process.env.NEXT_PUBLIC_SITE_URL!) ? next : `${origin}/portal`;

  if (!tokenHash || !type || !isEmailOtpType(type)) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid_link`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    console.error("auth/confirm: verifyOtp failed", { type, name: error.name, status: error.status });
    return NextResponse.redirect(`${origin}/sign-in?error=confirmation_failed`);
  }

  return NextResponse.redirect(safeNext);
}
