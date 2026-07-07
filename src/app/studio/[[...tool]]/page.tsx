"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

// Whole-page Client Component is correct here — the Studio is a
// self-contained editor SPA, not a marketing page.
export default function StudioPage() {
  return <NextStudio config={config} />;
}
