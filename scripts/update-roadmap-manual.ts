// Keeps the in-app "Roadmap to Success" manual (seeded by
// seed-roadmap-manual.ts) in sync with md-docs/roadmap/ROADMAP.md and its
// sibling phase files — reads them from disk and parses them into the
// manual's block format via scripts/lib/markdown-to-manual-sections.ts,
// rather than a hand-typed copy of their content (what this script used to
// be, and what drifted out of sync three separate times in one day before
// being rewritten this way on 2026-09-04).
// Run with: npx tsx --env-file=.env.local scripts/update-roadmap-manual.ts
// (must be run from the repo root — paths below are process.cwd()-relative)
//
// Safe to re-run: replaces the existing section tree each time.

import { readFileSync } from "fs";
import { join } from "path";
import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { manual, section } from "../lib/db/schema/app-schema";
import {
  parseMarkdownToSections,
  extractH1Title,
  type ParsedSection,
} from "./lib/markdown-to-manual-sections";

const roadmapSlug = "roadmap";
const roadmapTitle = "Roadmap to Success";
const roadmapSubtitle =
  "The plan to take Codestash from where it is to a real, paying-customer product.";

const ROADMAP_DIR = join(process.cwd(), "md-docs", "roadmap");
const PHASE_FILES = [
  "00-stabilize.md",
  "01-foundations.md",
  "02-billing.md",
  "03-core-product.md",
  "04-team-features.md",
  "05-polish.md",
  "06-scale-readiness.md",
];

// A phase's checklist is a "list" block whose unchecked items still carry
// their literal "[ ]" (see markdown-to-manual-sections.ts's bullet
// handling, which doesn't strip GFM task-list syntax) — so "does this
// phase still have work left" is just "does its raw content have a
// `- [ ]` line", no need to walk the parsed tree for it.
function isPhaseComplete(content: string): boolean {
  return !/^-\s*\[ \]/m.test(content);
}

function buildSections(): ParsedSection[] {
  const roadmapMd = readFileSync(join(ROADMAP_DIR, "ROADMAP.md"), "utf-8");
  const sections = parseMarkdownToSections(roadmapMd);

  const phasesSection = sections.find((s) => s.title === "The phases");
  if (!phasesSection) {
    throw new Error(
      'ROADMAP.md\'s "## The phases" section not found — did its heading text change?',
    );
  }

  const phaseContents = PHASE_FILES.map((file) => readFileSync(join(ROADMAP_DIR, file), "utf-8"));

  // "You are here" is derived, not hand-maintained: the first phase (in
  // order) whose checklist still has an unchecked item. -1 means every
  // phase's checklist is fully checked off — nothing currently "current".
  const currentIndex = phaseContents.findIndex((content) => !isPhaseComplete(content));

  phasesSection.children = phaseContents.map((content, i) => {
    const title = extractH1Title(content);
    if (!title) throw new Error(`${PHASE_FILES[i]} has no "# " title line.`);
    return parseMarkdownToSections(content, {
      rootTitle: i === currentIndex ? `${title} — you are here` : title,
    })[0];
  });

  // Same marker on the phase-table row, so it shows up in the at-a-glance
  // summary too, not just the expanded per-phase detail.
  if (currentIndex !== -1) {
    const tableBlock = phasesSection.blocks?.find((b) => b.type === "list");
    if (tableBlock?.type === "list") {
      const item = tableBlock.items[currentIndex];
      if (item) tableBlock.items[currentIndex] = `${item} — you are here`;
    }
  }

  return sections;
}

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) {
    throw new Error('No organization named "Codestash" found.');
  }

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
  });
  if (!owner) {
    throw new Error(`No owner member found for organization ${org.id}.`);
  }

  const sections = buildSections();

  const existing = await db.query.manual.findFirst({
    where: and(eq(manual.organizationId, org.id), eq(manual.slug, roadmapSlug)),
  });

  let manualId: string;
  if (existing) {
    manualId = existing.id;
    await db.delete(section).where(eq(section.manualId, manualId));
    await db
      .update(manual)
      .set({ title: roadmapTitle, subtitle: roadmapSubtitle })
      .where(eq(manual.id, manualId));
    console.log(`Clearing and refreshing existing manual "${roadmapSlug}" (${manualId}).`);
  } else {
    const categoryRow = await db.query.category.findFirst({
      where: (c, { eq: eq2, and: and2 }) =>
        and2(eq2(c.organizationId, org.id), eq2(c.slug, "manuals")),
    });
    if (!categoryRow) {
      throw new Error('No "manuals" category found for this org yet.');
    }
    manualId = crypto.randomUUID();
    await db.insert(manual).values({
      id: manualId,
      organizationId: org.id,
      categoryId: categoryRow.id,
      ownerId: owner.userId,
      slug: roadmapSlug,
      title: roadmapTitle,
      subtitle: roadmapSubtitle,
    });
    console.log(`Created new manual "${roadmapSlug}" (${manualId}).`);
  }

  let count = 0;
  async function insertLevel(nodes: ParsedSection[], parentId: string | null) {
    let prevRank: string | null = null;
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
        await insertLevel(node.children, id);
      }
    }
  }

  await insertLevel(sections, null);

  console.log(`Refreshed manual "${roadmapSlug}" (${manualId}) with ${count} sections.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
