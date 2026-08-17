import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/portal",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/auth/confirm",
        "/email-preferences/unsubscribe",
        "/job-alerts/unsubscribe",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
