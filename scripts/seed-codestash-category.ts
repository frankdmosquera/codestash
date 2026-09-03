// One-time: creates a "codestash" category (project meta-content — story,
// setup, roadmap, roles/billing plan) separate from "manuals" (actual dev
// reference material), and moves those 4 manuals into it.
// Run with: npx tsx --env-file=.env.local scripts/seed-codestash-category.ts
//
// Safe to re-run: skips category creation if the slug already exists, and
// the manual move is idempotent (setting categoryId to what it already is
// is a no-op).

import { eq, and, inArray } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization } from "../lib/db/schema/auth-schema";
import { category, manual } from "../lib/db/schema/app-schema";

const META_MANUAL_SLUGS = ["roadmap", "story", "setup", "roles-and-billing-plan"];

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) throw new Error('No organization named "Codestash" found.');

  const existingCategories = await db.query.category.findMany({
    where: eq(category.organizationId, org.id),
  });

  let codestashCategory = existingCategories.find((c) => c.slug === "codestash");

  if (!codestashCategory) {
    const maxRank = existingCategories
      .map((c) => c.rank)
      .sort((a, b) => a.localeCompare(b))
      .at(-1);
    const rank = generateKeyBetween(maxRank ?? null, null);

    const id = crypto.randomUUID();
    await db.insert(category).values({
      id,
      organizationId: org.id,
      slug: "codestash",
      label: "Codestash",
      description: "About this project itself — its story, setup, and build plan.",
      icon: "Folder",
      backgroundTheme: "default",
      rank,
    });
    codestashCategory = await db.query.category.findFirst({ where: eq(category.id, id) });
    console.log(`Created category "codestash" (${id}), rank ${rank}.`);
  } else {
    console.log(`Category "codestash" already exists (${codestashCategory.id}) — skipping creation.`);
  }

  if (!codestashCategory) throw new Error("Failed to create or find the codestash category.");

  const moved = await db
    .update(manual)
    .set({ categoryId: codestashCategory.id })
    .where(and(eq(manual.organizationId, org.id), inArray(manual.slug, META_MANUAL_SLUGS)))
    .returning({ slug: manual.slug });

  console.log(`Moved ${moved.length} manual(s) into "codestash": ${moved.map((m) => m.slug).join(", ")}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
