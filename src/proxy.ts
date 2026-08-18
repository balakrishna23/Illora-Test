import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/portal", "/admin"];

// Refreshes the Supabase session on every request — required because Server
// Components can't write cookies themselves, so an expired JWT would never
// get refreshed without this running first. Also does the actual
// /portal and /admin redirect; both layouts re-check via requireUser() as
// defense-in-depth.
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  // Only redirect on a *confirmed* absence of a session (no error, just no
  // user) — not when the auth check itself failed (network hiccup, etc).
  // Each protected layout re-checks via requireUser() anyway (defense in
  // depth, see comment above), so middleware doesn't need to be the sole
  // enforcer here. Failing open on a flaky auth call avoids redirecting an
  // actually-signed-in admin, which was itself hitting an unrelated
  // Next.js/hosting-proxy bug where that redirect response fails to
  // resolve ("failed to get redirect response TypeError: fetch failed").
  if (isProtected && error) {
    // Evidence log, not a guess: confirms (or disproves) whether this
    // middleware's own auth check is what's failing on /admin — remove
    // once that's settled.
    console.error("proxy: getUser() failed, letting request through instead of redirecting", {
      path: request.nextUrl.pathname,
      name: error.name,
      message: error.message,
      status: error.status,
    });
  }

  if (isProtected && !user && !error) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|pdf)(?:$|\\?)|_next/static|_next/image|favicon.ico)(?:.*))",
  ],
};
