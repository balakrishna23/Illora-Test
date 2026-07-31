import { eq } from "drizzle-orm";

import { db } from "@/server/db/client";
import { articles, siteSettings, teamMembers } from "@/server/db/schema";
import { SEED_ARTICLES, SEED_STATS, SEED_TEAM } from "@/server/db/seed-content-data";

async function main() {
  let articlesSeeded = 0;
  for (const article of SEED_ARTICLES) {
    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, article.slug))
      .limit(1);
    if (existing) continue;

    await db.insert(articles).values(article);
    articlesSeeded++;
  }

  let teamSeeded = 0;
  for (const member of SEED_TEAM) {
    const [existing] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.name, member.name))
      .limit(1);
    if (existing) continue;

    await db.insert(teamMembers).values(member);
    teamSeeded++;
  }

  const [existingStats] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
  let statsSeeded = false;
  if (!existingStats) {
    await db.insert(siteSettings).values(SEED_STATS);
    statsSeeded = true;
  }

  console.log(
    `Seeded ${articlesSeeded}/${SEED_ARTICLES.length} articles, ${teamSeeded}/${SEED_TEAM.length} team members, ` +
      `${statsSeeded ? 1 : 0}/1 site settings row (existing slugs/names/singleton skipped).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
