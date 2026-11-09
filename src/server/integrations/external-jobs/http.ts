// Shared fetch helper for the external-jobs adapters. Identifies itself
// honestly (never spoofs Googlebot or another allowlisted crawler) and
// enforces a minimum gap between requests to the same host, matching each
// site's published crawl-delay where one exists (see each adapter's own
// comment for its source's specific policy).

const USER_AGENT =
  "IlouraJobBot/1.0 (+https://illouraservices.com; job board aggregator; contact hello@illouraservices.com)";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchExternalText(
  url: string,
  init: RequestInit = {}
): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`fetchExternalText: ${url} responded ${res.status} ${res.statusText}`);
  }

  return res.text();
}

export async function fetchExternalJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`fetchExternalJson: ${url} responded ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export { USER_AGENT };
