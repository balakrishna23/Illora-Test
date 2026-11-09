import { AU_STATES } from "@/lib/job-constants";

// Approximate centroids for ingested jobs that only give a suburb/region name,
// not coordinates — good enough for the job-location map, not survey-grade.
// Extend SUBURB_CENTROIDS with specific suburbs as ingestion turns up ones
// worth pinning more precisely than the state fallback.
const STATE_CENTROIDS: Record<(typeof AU_STATES)[number], { latitude: number; longitude: number }> = {
  NSW: { latitude: -33.8688, longitude: 151.2093 }, // Sydney
  VIC: { latitude: -37.8136, longitude: 144.9631 }, // Melbourne
  QLD: { latitude: -27.4698, longitude: 153.0251 }, // Brisbane
  WA: { latitude: -31.9505, longitude: 115.8605 }, // Perth
  SA: { latitude: -34.9285, longitude: 138.6007 }, // Adelaide
  ACT: { latitude: -35.2809, longitude: 149.13 }, // Canberra
  NT: { latitude: -12.4634, longitude: 130.8456 }, // Darwin
  TAS: { latitude: -42.8821, longitude: 147.3272 }, // Hobart
};

const SUBURB_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  sydney: STATE_CENTROIDS.NSW,
  melbourne: STATE_CENTROIDS.VIC,
  brisbane: STATE_CENTROIDS.QLD,
  perth: STATE_CENTROIDS.WA,
  adelaide: STATE_CENTROIDS.SA,
  canberra: STATE_CENTROIDS.ACT,
  darwin: STATE_CENTROIDS.NT,
  hobart: STATE_CENTROIDS.TAS,
  parramatta: { latitude: -33.8151, longitude: 151.0011 },
  newcastle: { latitude: -32.9283, longitude: 151.7817 },
  wollongong: { latitude: -34.4278, longitude: 150.8931 },
  geelong: { latitude: -38.1499, longitude: 144.3617 },
  townsville: { latitude: -19.258, longitude: 146.8169 },
  cairns: { latitude: -16.9186, longitude: 145.7781 },
  toowoomba: { latitude: -27.5598, longitude: 151.9507 },
  "gold coast": { latitude: -28.0167, longitude: 153.4 },
  bunbury: { latitude: -33.3271, longitude: 115.6414 },
  launceston: { latitude: -41.4332, longitude: 147.1441 },
  "alice springs": { latitude: -23.698, longitude: 133.8807 },
};

// Falls back to the state's capital-city centroid when the location text
// doesn't match a known suburb — approximate by design (see module comment).
export function geocodeAuLocation(
  location: string,
  state: string
): { latitude: number; longitude: number } {
  const key = location.trim().toLowerCase();
  if (SUBURB_CENTROIDS[key]) return SUBURB_CENTROIDS[key];

  const stateKey = state.trim().toUpperCase() as (typeof AU_STATES)[number];
  if (STATE_CENTROIDS[stateKey]) return STATE_CENTROIDS[stateKey];

  // Unrecognized state text (shouldn't happen once normalizeJob validates
  // against AU_STATES) — centre of Australia rather than guessing a capital.
  return { latitude: -25.2744, longitude: 133.7751 };
}
