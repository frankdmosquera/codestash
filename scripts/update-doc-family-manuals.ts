// Keeps the in-app "Story" / "Setup" / "Roles & Billing Plan" / "Rules"
// manuals in sync with STORY.md, SETUP.md, ROLES-AND-BILLING-PLAN.md, and
// RULES.md — reads each file from disk and parses it via
// scripts/lib/markdown-to-manual-sections.ts, rather than a hand-typed
// duplicate of its content (what this script used to be, and what drifted
// out of sync three separate times in one day before being rewritten this
// way on 2026-09-04). Also the first place RULES.md gets mirrored in-app
// at all — it never had a manual before.
// Run with: npx tsx --env-file=.env.local scripts/update-doc-family-manuals.ts
// (must be run from the repo root — paths below are process.cwd()-relative)
//
// Safe to re-run: creates a manual if it doesn't exist yet, otherwise
// replaces its section tree.

import { readFileSync } from "fs";
import { join } from "path";
import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { manual, section, category } from "../lib/db/schema/app-schema";
import {
  parseMarkdownToSections,
  type ParsedSection,
} from "./lib/markdown-to-manual-sections";

const MD_DOCS_DIR = join(process.cwd(), "md-docs");

type DocManual = {
  file: string;
  slug: string;
  title: string;
  subtitle: string;
};

const docs: DocManual[] = [
  {
    file: "STORY.md",
    slug: "story",
    title: "The Story",
    subtitle: "How Codestash actually came to be, told as it happened.",
  },
  {
    file: "SETUP.md",
    slug: "setup",
    title: "Project Setup & Context",
    subtitle: "The practical get-it-running guide, plus where things actually stand today.",
  },
  {
    file: "ROLES-AND-BILLING-PLAN.md",
    slug: "roles-and-billing-plan",
    title: "Organizations, Roles & Billing Plan",
    subtitle: "Agreed direction for paid organizations, seats, roles, and plan tiers.",
  },
  {
    file: "RULES.md",
    slug: "rules",
    title: "Project Rules",
    subtitle: "Conventions agreed on for this project specifically, on top of the global rules.",
  },
];

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
      if (node.children?.length) {
        count += await insertLevel(manualId, node.children, id);
      }
    }
    return count;
  }

  for (const doc of docs) {
    const content = readFileSync(join(MD_DOCS_DIR, doc.file), "utf-8");
    const sections = parseMarkdownToSections(content);

    const existing = await db.query.manual.findFirst({
      where: and(eq(manual.organizationId, org.id), eq(manual.slug, doc.slug)),
    });

    let manualId: string;
    if (existing) {
      manualId = existing.id;
      await db.delete(section).where(eq(section.manualId, manualId));
      await db
        .update(manual)
        .set({ title: doc.title, subtitle: doc.subtitle })
        .where(eq(manual.id, manualId));
    } else {
      const categoryRow = await db.query.category.findFirst({
        where: and(eq(category.organizationId, org.id), eq(category.slug, "codestash")),
      });
      if (!categoryRow) {
        throw new Error('No "codestash" category found for this org yet.');
      }
      manualId = crypto.randomUUID();
      await db.insert(manual).values({
        id: manualId,
        organizationId: org.id,
        categoryId: categoryRow.id,
        ownerId: owner.userId,
        slug: doc.slug,
        title: doc.title,
        subtitle: doc.subtitle,
      });
      console.log(`Created new manual "${doc.slug}" (${manualId}).`);
    }

    const count = await insertLevel(manualId, sections, null);
    console.log(`Refreshed manual "${doc.slug}" (${manualId}) with ${count} sections.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
