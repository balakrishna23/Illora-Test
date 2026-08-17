import path from "node:path";
import type { NextConfig } from "next";

// Content-Security-Policy: only the directives that are safe without a full
// per-service audit are set here. base-uri/object-src/frame-ancestors carry
// real value (block base-tag hijacking, plugin injection, and clickjacking)
// and don't touch script/connect/style, so they can't break Supabase Auth
// flows or Next hydration. A full script-src (ideally nonce-based) is
// deliberately deferred until it can be live-tested against the current app.
const contentSecurityPolicy = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join("; ");

// Baseline security headers.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
