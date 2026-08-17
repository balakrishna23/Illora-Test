// Single source of truth for the site's public origin. Falls back to
// localhost only for local dev — production must set NEXT_PUBLIC_SITE_URL.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
