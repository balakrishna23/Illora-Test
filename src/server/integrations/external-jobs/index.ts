import { apsJobsSource } from "@/server/integrations/external-jobs/aps-jobs";
import { actJobSource } from "@/server/integrations/external-jobs/act";
import { ntJobSource } from "@/server/integrations/external-jobs/nt";
import { qldJobSource } from "@/server/integrations/external-jobs/qld";
import { tasJobSource } from "@/server/integrations/external-jobs/tas";
import { vicJobSource } from "@/server/integrations/external-jobs/vic";
import { waJobSource } from "@/server/integrations/external-jobs/wa";
import { workforceAustraliaJobSource } from "@/server/integrations/external-jobs/workforce-australia";
import type { ExternalJobSource } from "@/server/integrations/external-jobs/types";

// NSW and SA are deliberately absent: NSW is actively bot-protected
// (Cloudflare challenge) and its own content-usage policy is reference-only
// anyway; SA's legacy session-bound job board didn't yield a reliable
// integration in the time invested so far. Both can be added later as their
// own adapters once resolved — see the "External government job ingestion"
// plan doc for the investigation notes.
export const EXTERNAL_JOB_SOURCES: ExternalJobSource[] = [
  apsJobsSource,
  workforceAustraliaJobSource,
  vicJobSource,
  qldJobSource,
  waJobSource,
  tasJobSource,
  actJobSource,
  ntJobSource,
];
