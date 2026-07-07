import postgres from "postgres";

const connectionString = process.env.ADMIN_ASSISTANT_DATABASE_URL;

if (!connectionString) {
  console.warn(
    "ADMIN_ASSISTANT_DATABASE_URL is not set — the admin AI assistant is falling back " +
      "to DATABASE_URL. Strongly recommended: point this at a read-only Postgres role " +
      "before relying on this feature. The SQL validator in sql-safety.ts is " +
      "defense-in-depth only, not a substitute for DB-level read-only permissions."
  );
}

const resolvedConnectionString = connectionString || process.env.DATABASE_URL;
if (!resolvedConnectionString) {
  throw new Error("Neither ADMIN_ASSISTANT_DATABASE_URL nor DATABASE_URL is set");
}

// See src/server/db/client.ts for why this is cached on globalThis — same
// dev-hot-reload connection-pool-exhaustion issue applies here.
const globalForDb = globalThis as unknown as { adminAssistantPgClient?: ReturnType<typeof postgres> };

export const adminAssistantSql =
  globalForDb.adminAssistantPgClient ?? postgres(resolvedConnectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.adminAssistantPgClient = adminAssistantSql;
}
