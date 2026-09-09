// Mirrors the next-ai-sdk project's per-route docs (docs/ai-tools/*.md,
// generated there by `node scripts/build-ai-tools-docs.ts`) into an
// "ai-tools" category as one manual per route. Same approach as
// update-doc-family-manuals.ts: read real markdown from disk, parse it via
// scripts/lib/markdown-to-manual-sections.ts, never hand-type content.
//
// Run from the repo root:
//   npx tsx --env-file=.env.local scripts/seed-ai-tools-manuals.ts <path-to-docs/ai-tools> [owner-email]
//
// Safe to re-run: creates the category and manuals if missing, otherwise
// updates title/subtitle/rank and replaces each manual's section tree.

import { readFileSync } from "fs";
import { join, resolve } from "path";
import { and, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { member, user } from "../lib/db/schema/auth-schema";
import { category, manual, section } from "../lib/db/schema/app-schema";
import {
  parseMarkdownToSections,
  type ParsedSection,
} from "./lib/markdown-to-manual-sections";

const CATEGORY_SLUG = "ai-tools";

type Manifest = {
  generatedAt: string;
  groups: string[];
  tools: {
    slug: string;
    title: string;
    group: string;
    subtitle: string;
    isNew: boolean;
    file: string;
  }[];
};

async function main() {
  const [docsDirArg, emailArg] = process.argv.slice(2);
  if (!docsDirArg) {
    throw new Error("Usage: seed-ai-tools-manuals.ts <path-to-docs/ai-tools> [owner-email]");
  }
  const docsDir = resolve(process.cwd(), docsDirArg);
  const email = emailArg ?? "frankdmosquera@gmail.com";

  const manifest: Manifest = JSON.parse(readFileSync(join(docsDir, "manifest.json"), "utf-8"));

  const owner = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!owner) throw new Error(`No user with email ${email}.`);

  // The user's org: prefer a membership where they can write (owner/admin).
  const memberships = await db.query.member.findMany({ where: eq(member.userId, owner.id) });
  const membership =
    memberships.find((m) => m.role === "owner") ??
    memberships.find((m) => m.role === "admin") ??
    memberships[0];
  if (!membership) throw new Error(`${email} is not a member of any organization.`);
  const orgId = membership.organizationId;
  console.log(`Org ${orgId} (role ${membership.role}), owner user ${owner.id}`);

  // Category
  const existingCategories = await db.query.category.findMany({
    where: eq(category.organizationId, orgId),
  });
  let aiToolsCategory = existingCategories.find((c) => c.slug === CATEGORY_SLUG);
  if (!aiToolsCategory) {
    const maxRank = existingCategories.map((c) => c.rank).sort((a, b) => a.localeCompare(b)).at(-1);
    const id = crypto.randomUUID();
    await db.insert(category).values({
      id,
      organizationId: orgId,
      slug: CATEGORY_SLUG,
      label: "AI tools",
      description:
        "One manual per AI SDK 7 route in next-ai-sdk: route code, client usage, what changed from v5, and the docs it was built from.",
      icon: "Bot",
      backgroundTheme: "default",
      rank: generateKeyBetween(maxRank ?? null, null),
    });
    aiToolsCategory = await db.query.category.findFirst({ where: eq(category.id, id) });
    console.log(`Created category "${CATEGORY_SLUG}" (${id}).`);
  } else {
    console.log(`Category "${CATEGORY_SLUG}" exists (${aiToolsCategory.id}).`);
  }
  if (!aiToolsCategory) throw new Error("Category lookup failed.");
  const categoryId = aiToolsCategory.id;

  async function insertLevel(manualId: string, nodes: ParsedSection[], parentId: string | null) {
    let prevRank: string | null = null;
    let count = 0;
    for (const node of nodes) {
      const rank = generateKeyBetween(prevRank, null);
      prevRank = rank;
      const id = crypto.randomUUID();
      await db.insert(section).values({
        id,
        manualId,
        parentId,
        rank,
        title: node.title,
        blocks: node.blocks ?? [],
      });
      count++;
      if (node.children?.length) count += await insertLevel(manualId, node.children, id);
    }
    return count;
  }

  // Manuals, in manifest order (grouped), ranked sequentially.
  let prevRank: string | null = null;
  let created = 0;
  let updated = 0;

  for (const tool of manifest.tools) {
    const markdown = readFileSync(join(docsDir, tool.file), "utf-8");
    const sections = parseMarkdownToSections(markdown);
    const rank = generateKeyBetween(prevRank, null);
    prevRank = rank;

    // Manual slugs are unique per org. If a manual with this slug already
    // lives in ANOTHER category, use a prefixed slug instead of hijacking it.
    let slug = tool.slug;
    const sameSlug = await db.query.manual.findFirst({
      where: and(eq(manual.organizationId, orgId), eq(manual.slug, slug)),
    });
    if (sameSlug && sameSlug.categoryId !== categoryId) {
      slug = `ai-sdk-${tool.slug}`;
    }

    const existing = await db.query.manual.findFirst({
      where: and(eq(manual.organizationId, orgId), eq(manual.slug, slug)),
    });

    const title = tool.title;
    const subtitle = `${tool.group} · ${tool.subtitle}`;

    let manualId: string;
    if (existing) {
      manualId = existing.id;
      await db.delete(section).where(eq(section.manualId, manualId));
      await db
        .update(manual)
        .set({ title, subtitle, rank, categoryId, deletedAt: null })
        .where(eq(manual.id, manualId));
      updated++;
    } else {
      manualId = crypto.randomUUID();
      await db.insert(manual).values({
        id: manualId,
        organizationId: orgId,
        categoryId,
        ownerId: owner.id,
        slug,
        title,
        subtitle,
        rank,
      });
      created++;
    }

    const count = await insertLevel(manualId, sections, null);
    console.log(`  ${existing ? "updated" : "created"} ${slug} (${count} sections)`);
  }

  console.log(`Done: ${created} created, ${updated} updated, category /${CATEGORY_SLUG}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
