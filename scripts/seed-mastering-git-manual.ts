// One-time migration: inserts the (now-corrected) mastering-git.ts manual —
// the one genuinely hand-authored manual — as a `manual` + `section` tree
// for the real Codestash workspace. This is the "5.2 pilot" from the
// next16-neon-better-auth roadmap.
// Run with: npx tsx --env-file=.env.local scripts/seed-mastering-git-manual.ts
//
// Safe to re-run: does nothing if a manual with this slug already exists
// for the org.

import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { category, manual, section } from "../lib/db/schema/app-schema";
import { masteringGit } from "../lib/data/manuals/mastering-git";
import type { ManualSection } from "../lib/data/types";

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

  const categoryRow = await db.query.category.findFirst({
    where: and(eq(category.organizationId, org.id), eq(category.slug, "manuals")),
  });
  if (!categoryRow) {
    throw new Error('No "manuals" category found for this org yet.');
  }

  const existing = await db.query.manual.findFirst({
    where: and(eq(manual.organizationId, org.id), eq(manual.slug, masteringGit.slug)),
  });
  if (existing) {
    console.log(`Manual "${masteringGit.slug}" already exists (id ${existing.id}) — nothing to do.`);
    process.exit(0);
  }

  const manualId = crypto.randomUUID();
  await db.insert(manual).values({
    id: manualId,
    organizationId: org.id,
    categoryId: categoryRow.id,
    ownerId: owner.userId,
    slug: masteringGit.slug,
    title: masteringGit.title,
    subtitle: masteringGit.subtitle,
  });

  let count = 0;
  async function insertLevel(nodes: ManualSection[], parentId: string | null) {
    let prevRank: string | null = null;
    for (const node of nodes) {
      const rank = generateKeyBetween(prevRank, null);
      prevRank = rank;
      await db.insert(section).values({
        id: crypto.randomUUID(),
        manualId,
        parentId,
        rank,
        title: node.title,
        blocks: node.blocks ?? [],
      });
      count++;
      const inserted = await db.query.section.findFirst({
        where: and(eq(section.manualId, manualId), eq(section.rank, rank)),
      });
      if (node.children?.length && inserted) {
        await insertLevel(node.children, inserted.id);
      }
    }
  }

  await insertLevel(masteringGit.sections, null);

  console.log(`Seeded manual "${masteringGit.slug}" (${manualId}) with ${count} sections.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
