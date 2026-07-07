import { db } from "@/server/db/client";
import { jobs } from "@/server/db/schema";
import { SEED_JOBS } from "@/server/db/seed-data";

async function main() {
  const inserted = await db
    .insert(jobs)
    .values(SEED_JOBS)
    .onConflictDoNothing({ target: jobs.slug })
    .returning({ slug: jobs.slug });

  console.log(`Seeded ${inserted.length} of ${SEED_JOBS.length} jobs (existing slugs skipped).`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
