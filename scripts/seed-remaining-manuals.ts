// Migrates the remaining static manuals (everything except mastering-git,
// already seeded separately) into manual+section rows for the real
// Codestash workspace. Completes step 5 for the "manuals" category —
// without this, `getResolvedItemsForCategory`'s "any DB rows → drop the
// static fallback entirely" logic hides these 4 manuals for a signed-in
// user, since the category already has *some* DB rows (mastering-git).
// Run with: npx tsx --env-file=.env.local scripts/seed-remaining-manuals.ts
//
// Safe to re-run: skips any manual slug that already exists for the org.

import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { category, manual, section } from "../lib/db/schema/app-schema";
import { dockerForFrontendDevs } from "../lib/data/manuals/docker-for-frontend-devs";
import { understandingRsc } from "../lib/data/manuals/understanding-rsc";
import { cicdBasics } from "../lib/data/manuals/cicd-basics";
import { debuggingNextjs } from "../lib/data/manuals/debugging-nextjs";
import type { Manual, ManualSection } from "../lib/data/types";

const manuals: Manual[] = [dockerForFrontendDevs, understandingRsc, cicdBasics, debuggingNextjs];

async function insertLevel(manualId: string, nodes: ManualSection[], parentId: string | null) {
  let prevRank: string | null = null;
  let count = 0;
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
    if (node.children?.length) {
      const inserted = await db.query.section.findFirst({
        where: and(eq(section.manualId, manualId), eq(section.rank, rank)),
      });
      if (inserted) count += await insertLevel(manualId, node.children, inserted.id);
    }
  }
  return count;
}

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) throw new Error('No organization named "Codestash" found.');

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
  });
  if (!owner) throw new Error(`No owner member found for organization ${org.id}.`);

  const categoryRow = await db.query.category.findFirst({
    where: and(eq(category.organizationId, org.id), eq(category.slug, "manuals")),
  });
  if (!categoryRow) throw new Error('No "manuals" category found for this org yet.');

  for (const m of manuals) {
    const existing = await db.query.manual.findFirst({
      where: and(eq(manual.organizationId, org.id), eq(manual.slug, m.slug)),
    });
    if (existing) {
      console.log(`"${m.slug}" already exists — skipping.`);
      continue;
    }

    const manualId = crypto.randomUUID();
    await db.insert(manual).values({
      id: manualId,
      organizationId: org.id,
      categoryId: categoryRow.id,
      ownerId: owner.userId,
      slug: m.slug,
      title: m.title,
      subtitle: m.subtitle,
    });

    const count = await insertLevel(manualId, m.sections, null);
    console.log(`Seeded "${m.slug}" (${manualId}) with ${count} sections.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
