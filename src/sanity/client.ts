import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/sanity/env";

// `projectId` may be unset until a real Sanity project is configured — the
// consumers in server/integrations/sanity.ts guard against that and fall
// back gracefully rather than crash every page that renders CMS content.
export const sanityClient = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;
