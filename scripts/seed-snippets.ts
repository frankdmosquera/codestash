// One-time migration: inserts the static hooks/helpers/blocks/ai-instructions
// content (lib/data/*) as `snippet` rows for the real "Codestash" workspace.
// Run with: npx tsx --env-file=.env.local scripts/seed-snippets.ts
//
// Safe to re-run — uses onConflictDoNothing on the (organizationId, slug)
// unique index, so already-seeded snippets are skipped, not duplicated.

import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { category, snippet } from "../lib/db/schema/app-schema";
import { hooks } from "../lib/data/hooks";
import { helpers } from "../lib/data/helpers";
import { blocks } from "../lib/data/blocks";
import { aiInstructions } from "../lib/data/ai-instructions";
import type { Snippet } from "../lib/data/types";

const CATEGORY_SLUGS = {
  hooks: "hooks",
  helpers: "helpers",
  blocks: "blocks",
  aiInstructions: "ai-instructions",
} as const;

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) {
    throw new Error('No organization named "Codestash" found — seed the workspace first.');
  }

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
  });
  if (!owner) {
    throw new Error(`No owner member found for organization ${org.id}.`);
  }

  const groups: Array<[keyof typeof CATEGORY_SLUGS, Snippet[]]> = [
    ["hooks", hooks],
    ["helpers", helpers],
    ["blocks", blocks],
    ["aiInstructions", aiInstructions],
  ];

  for (const [key, items] of groups) {
    const categoryRow = await db.query.category.findFirst({
      where: and(eq(category.organizationId, org.id), eq(category.slug, CATEGORY_SLUGS[key])),
    });
    if (!categoryRow) {
      console.warn(`Skipping "${key}" — no category row with slug "${CATEGORY_SLUGS[key]}" for this org yet.`);
      continue;
    }

    if (items.length === 0) continue;

    const inserted = await db
      .insert(snippet)
      .values(
        items.map((item) => ({
          id: crypto.randomUUID(),
          organizationId: org.id,
          categoryId: categoryRow.id,
          ownerId: owner.userId,
          slug: item.slug,
          title: item.title,
          description: item.description ?? null,
          code: item.code,
        })),
      )
      .onConflictDoNothing({ target: [snippet.organizationId, snippet.slug] })
      .returning({ slug: snippet.slug });

    console.log(`${key}: inserted ${inserted.length}/${items.length}`);
  }
}

main()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
