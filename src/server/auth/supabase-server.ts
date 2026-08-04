import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set");
}

// A fresh client per call, bound to the current request's cookie jar — cheap
// (fetch-based, not a pooled DB connection), so this is never memoized.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, which can't set cookies — safe
            // to ignore: src/proxy.ts refreshes the session on every request.
            // Server Actions and Route Handlers CAN set cookies, and that's
            // where sign-in/up/out/change-password/change-email run.
          }
        },
      },
    }
  );
}
