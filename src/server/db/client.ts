import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/server/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Cached on globalThis so Next.js dev hot-reloads (which re-evaluate this
// module on every file save) reuse the same connection pool instead of
// opening a new one each time — otherwise the pool exhausts Supabase's
// Session Pooler client limit within a single dev session.
const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

// max: 5 — Supabase's Session Pooler caps the whole project at 15 clients;
// postgres-js defaults to 10 per process, so a dev server plus build workers
// (or two server processes) can exhaust the pool and hard-fail queries.
const client =
  globalForDb.pgClient ?? postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle({ client, schema });
