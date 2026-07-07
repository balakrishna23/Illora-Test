import path from "node:path";
import type { NextConfig } from "next";

// Baseline security headers. A full Content-Security-Policy is deliberately
// omitted for now — Clerk, Sanity Studio, and Next dev tooling each need
// their own allowances and a broken CSP silently kills auth/editing; add one
// with per-service directives as a dedicated task before launch.
const securityHeaders = [
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
