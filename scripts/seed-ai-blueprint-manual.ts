// One-time: adds the "AI Blueprint: One Command, Two Stacks" manual to the
// "manuals" category, parsed from md-docs/AI-BLUEPRINT-WORKFLOW.md via the
// same markdown-to-manual-sections pipeline the doc-family sync scripts use
// (see update-doc-family-manuals.ts) — one copy of the content, not a
// hand-typed duplicate.
// Run with: npx tsx --env-file=.env.local scripts/seed-ai-blueprint-manual.ts
//
// Safe to re-run: replaces the section tree if the manual already exists.

import { readFileSync } from "fs";
import { join } from "path";
import { and, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { manual, section, category } from "../lib/db/schema/app-schema";
import { parseMarkdownToSections, type ParsedSection } from "./lib/markdown-to-manual-sections";

const SLUG = "ai-blueprint-workflow";
const TITLE = "AI Blueprint: One Command, Two Stacks";
const SUBTITLE = "Start a new project with one installer command, pick a stack, and land in the same feature loop either way.";

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) throw new Error('No organization named "Codestash" found.');

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
  });
  if (!owner) throw new Error(`No owner member found for organization ${org.id}.`);

  async function insertLevel(manualId: string, nodes: ParsedSection[], parentId: string | null): Promise<number> {
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
      if (node.children?.length) {
        count += await insertLevel(manualId, node.children, id);
      }
    }
    return count;
  }

  const content = readFileSync(join(process.cwd(), "md-docs", "AI-BLUEPRINT-WORKFLOW.md"), "utf-8");
  const sections = parseMarkdownToSections(content);

  const existing = await db.query.manual.findFirst({
    where: and(eq(manual.organizationId, org.id), eq(manual.slug, SLUG)),
  });

  let manualId: string;
  if (existing) {
    manualId = existing.id;
    await db.delete(section).where(eq(section.manualId, manualId));
    await db.update(manual).set({ title: TITLE, subtitle: SUBTITLE }).where(eq(manual.id, manualId));
  } else {
    const categoryRow = await db.query.category.findFirst({
      where: and(eq(category.organizationId, org.id), eq(category.slug, "manuals")),
    });
    if (!categoryRow) throw new Error('No "manuals" category found for this org yet.');

    const siblings = await db.query.manual.findMany({ where: eq(manual.categoryId, categoryRow.id) });
    const lastRank = siblings.map((m) => m.rank).sort().at(-1) ?? null;
    manualId = crypto.randomUUID();
    await db.insert(manual).values({
      id: manualId,
      organizationId: org.id,
      categoryId: categoryRow.id,
      ownerId: owner.userId,
      slug: SLUG,
      title: TITLE,
      subtitle: SUBTITLE,
      rank: generateKeyBetween(lastRank, null),
    });
    console.log(`Created new manual "${SLUG}" (${manualId}).`);
  }

  const count = await insertLevel(manualId, sections, null);
  console.log(`Refreshed manual "${SLUG}" (${manualId}) with ${count} sections.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
