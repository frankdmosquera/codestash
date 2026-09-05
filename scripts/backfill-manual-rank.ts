// One-time backfill: assigns a fractional-indexing rank to every existing
// manual row, scoped per category, ordered by current title (the order
// they were shown in before rank existed) — so turning on drag-and-drop
// doesn't visibly reshuffle anything that was already there.
// Run with: npx tsx --env-file=.env.local scripts/backfill-manual-rank.ts
//
// Safe to re-run: skips any manual that already has a rank.

import { asc, eq, isNull } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { manual } from "../lib/db/schema/app-schema";

async function main() {
  const categoryIds = await db
    .selectDistinct({ categoryId: manual.categoryId })
    .from(manual)
    .where(isNull(manual.rank));

  let updated = 0;
  for (const { categoryId } of categoryIds) {
    const rows = await db.query.manual.findMany({
      where: eq(manual.categoryId, categoryId),
      orderBy: asc(manual.title),
    });

    let prevRank: string | null = null;
    for (const row of rows) {
      if (row.rank) {
        prevRank = row.rank;
        continue;
      }
      const rank = generateKeyBetween(prevRank, null);
      prevRank = rank;
      await db.update(manual).set({ rank }).where(eq(manual.id, row.id));
      updated++;
    }
  }

  console.log(`Backfilled rank for ${updated} manual(s) across ${categoryIds.length} categor${categoryIds.length === 1 ? "y" : "ies"}.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
