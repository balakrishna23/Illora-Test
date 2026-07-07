import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/sanity/env";
import { SEED_ARTICLES, SEED_STATS, SEED_TEAM } from "@/server/db/seed-sanity-data";

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set");
}
if (!process.env.SANITY_API_WRITE_TOKEN) {
  throw new Error(
    "SANITY_API_WRITE_TOKEN is not set — generate an Editor-permission token from " +
      "the Sanity project's API tokens page. This is a one-time migration credential, " +
      "never read by the app at runtime."
  );
}

// Write-capable client — distinct from src/sanity/client.ts, which is
// read-only and used by the running app.
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

async function main() {
  let articlesSeeded = 0;
  for (const article of SEED_ARTICLES) {
    const existing = await writeClient.fetch(
      `*[_type == "article" && slug.current == $slug][0]._id`,
      { slug: article.slug }
    );
    if (existing) continue;

    await writeClient.create({
      _type: "article",
      title: article.title,
      slug: { _type: "slug", current: article.slug },
      category: article.category,
      publishDate: article.publishDate,
      readingTimeMinutes: article.readingTimeMinutes,
      excerpt: article.excerpt,
      body: article.body,
      authorName: article.authorName,
      authorRole: article.authorRole,
    });
    articlesSeeded++;
  }

  let teamSeeded = 0;
  for (const member of SEED_TEAM) {
    const existing = await writeClient.fetch(
      `*[_type == "teamMember" && name == $name][0]._id`,
      { name: member.name }
    );
    if (existing) continue;

    await writeClient.create({ _type: "teamMember", ...member });
    teamSeeded++;
  }

  const existingStats = await writeClient.fetch(`*[_type == "siteStats"][0]._id`);
  let statsSeeded = false;
  if (!existingStats) {
    await writeClient.create({ _type: "siteStats", ...SEED_STATS });
    statsSeeded = true;
  }

  console.log(
    `Seeded ${articlesSeeded}/${SEED_ARTICLES.length} articles, ${teamSeeded}/${SEED_TEAM.length} team members, ` +
      `${statsSeeded ? 1 : 0}/1 site stats doc (existing slugs/names/singleton skipped).`
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
