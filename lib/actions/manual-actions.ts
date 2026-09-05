"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, manual, section } from "@/lib/db/schema/app-schema";
import { requireOrgRole } from "@/lib/actions/require-org-role";
import { slugify } from "@/lib/utils";
import {
  createManualValidationSchema,
  updateManualValidationSchema,
  type CreateManualValidationInput,
  type UpdateManualValidationInput,
} from "@/lib/validations/manual-validation";
import type { ContentBlock, Manual, ManualSection } from "@/lib/data/types";

export type DbManualRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  rank: string;
  createdAt: Date;
};

// Sidebar subitems for a DB-backed category — scoped to the caller's active
// org so one workspace never sees another's manuals. Every route that
// reaches this requires a session (see proxy.ts).
export async function getManualsForCategory(categoryId: string): Promise<DbManualRow[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) return [];

  return db
    .select({
      id: manual.id,
      slug: manual.slug,
      title: manual.title,
      subtitle: manual.subtitle,
      rank: manual.rank,
      createdAt: manual.createdAt,
    })
    .from(manual)
    .where(and(eq(manual.organizationId, organizationId), eq(manual.categoryId, categoryId)))
    .orderBy(asc(manual.rank));
}

// Moves `manualId` to sit between `beforeRank` and `afterRank` within its
// category (either may be null for "start of list" / "end of list") — same
// pattern as reorderCategoryAction. Reordering a category's manuals is an
// owner/admin action, not something a non-paying member gets to do.
// Verifies the manual actually belongs to the caller's active org before
// writing — the client only sends ranks, never trusts them for authorization.
export async function reorderManualAction(
  manualId: string,
  beforeRank: string | null,
  afterRank: string | null,
) {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);

  const newRank = generateKeyBetween(beforeRank, afterRank);

  const updated = await db
    .update(manual)
    .set({ rank: newRank })
    .where(and(eq(manual.id, manualId), eq(manual.organizationId, organizationId)))
    .returning({ id: manual.id });

  if (updated.length === 0) {
    throw new Error("Manual not found in your active workspace");
  }

  return { rank: newRank };
}

// One section = one block, flat (no nesting) — v1 scope for the
// create/edit form: a section is either a paragraph of text or a single
// code snippet, never both. Richer per-section content is later work.
function sectionInputToBlock(input: { kind: "text" | "code"; content: string }): ContentBlock {
  return input.kind === "code" ? { type: "code", code: input.content } : { type: "p", text: input.content };
}

// Creates a manual (+ its flat list of sections) in the caller's active
// workspace — owner/admin only, same as category creation. Verifies the
// target category actually belongs to the caller's org before writing —
// the client only sends a categoryId, never trusted for authorization.
export async function createManualAction(input: CreateManualValidationInput) {
  const { organizationId, userId } = await requireOrgRole(["owner", "admin"]);
  const { categoryId, title, subtitle, sections } = createManualValidationSchema.parse(input);

  const categoryRow = await db.query.category.findFirst({
    where: and(eq(category.id, categoryId), eq(category.organizationId, organizationId)),
  });
  if (!categoryRow) {
    throw new Error("Category not found in your active workspace");
  }

  const slug = slugify(title);
  if (!slug) {
    throw new Error("That name doesn't produce a usable URL slug");
  }

  const existingManual = await db.query.manual.findFirst({
    where: and(eq(manual.organizationId, organizationId), eq(manual.slug, slug)),
  });
  if (existingManual) {
    throw new Error(`A manual named "${title}" already exists`);
  }

  const siblingManuals = await db.query.manual.findMany({
    where: eq(manual.categoryId, categoryId),
  });
  const lastManualRank = siblingManuals.map((m) => m.rank).sort().at(-1) ?? null;

  const manualId = crypto.randomUUID();
  await db.insert(manual).values({
    id: manualId,
    organizationId,
    categoryId,
    ownerId: userId,
    slug,
    title,
    subtitle: subtitle || null,
    rank: generateKeyBetween(lastManualRank, null),
  });

  let prevSectionRank: string | null = null;
  for (const sectionInput of sections) {
    const rank = generateKeyBetween(prevSectionRank, null);
    prevSectionRank = rank;
    await db.insert(section).values({
      id: crypto.randomUUID(),
      manualId,
      parentId: null,
      rank,
      title: sectionInput.title,
      blocks: [sectionInputToBlock(sectionInput)],
    });
  }

  return { id: manualId, slug };
}

// Replaces a manual's title/subtitle/sections wholesale — same
// "delete-then-reinsert" pattern the doc-family sync scripts use, simplest
// correct option for a flat, unnested section list. Deliberately never
// changes the slug (even if the title does) so existing links to this
// manual never break on edit.
export async function updateManualAction(input: UpdateManualValidationInput) {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);
  const { manualId, title, subtitle, sections: sectionInputs } = updateManualValidationSchema.parse(input);

  const existingManual = await db.query.manual.findFirst({
    where: and(eq(manual.id, manualId), eq(manual.organizationId, organizationId)),
  });
  if (!existingManual) {
    throw new Error("Manual not found in your active workspace");
  }

  await db.update(manual).set({ title, subtitle: subtitle || null }).where(eq(manual.id, manualId));
  await db.delete(section).where(eq(section.manualId, manualId));

  let prevSectionRank: string | null = null;
  for (const sectionInput of sectionInputs) {
    const rank = generateKeyBetween(prevSectionRank, null);
    prevSectionRank = rank;
    await db.insert(section).values({
      id: crypto.randomUUID(),
      manualId,
      parentId: null,
      rank,
      title: sectionInput.title,
      blocks: [sectionInputToBlock(sectionInput)],
    });
  }

  return { id: manualId, slug: existingManual.slug };
}

// Shared by getManualBySlug, getResolvedItemsForCategory, and the
// [category]/[subpage] routes — turns a URL category slug into a DB
// category row, scoped to the caller's active org. Every route that
// reaches this requires a session (see proxy.ts).
export async function getDbCategoryBySlug(categorySlug: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) return undefined;

  return db.query.category.findFirst({
    where: and(eq(category.organizationId, organizationId), eq(category.slug, categorySlug)),
  });
}

type FlatSectionRow = {
  id: string;
  parentId: string | null;
  rank: string;
  title: string;
  blocks: unknown;
};

// Sections are stored flat with parentId + rank (see section-schema.ts) —
// the dotted "1.2" numbering is computed here by walking the tree in rank
// order, never stored, so reordering or inserting a section never touches
// its siblings' numbers.
function buildSectionTree(rows: FlatSectionRow[]): ManualSection[] {
  const byParent = new Map<string | null, FlatSectionRow[]>();
  for (const row of rows) {
    const siblings = byParent.get(row.parentId) ?? [];
    siblings.push(row);
    byParent.set(row.parentId, siblings);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.rank.localeCompare(b.rank));
  }

  function build(parentId: string | null, prefix: string): ManualSection[] {
    const siblings = byParent.get(parentId) ?? [];
    return siblings.map((row, i) => {
      const number = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      const children = build(row.id, number);
      return {
        id: row.id,
        number,
        title: row.title,
        blocks: row.blocks as ContentBlock[],
        ...(children.length > 0 ? { children } : {}),
      };
    });
  }

  return build(null, "");
}

// Resolves a DB-backed manual for the [category]/[subpage] route — checked
// only after the static catalog comes up empty for that slug. Returns the
// same `Manual` shape the static catalog uses, so the page can render it
// through the existing ManualPage/ManualAccordion instead of a separate
// component. Wrapped in `cache` since generateMetadata and the page
// component both need it for the same request.
export const getManualBySlug = cache(
  async (categorySlug: string, manualSlug: string): Promise<Manual | undefined> => {
    const categoryRow = await getDbCategoryBySlug(categorySlug);
    if (!categoryRow) return undefined;

    const manualRow = await db.query.manual.findFirst({
      where: and(eq(manual.categoryId, categoryRow.id), eq(manual.slug, manualSlug)),
      with: { sections: true },
    });
    if (!manualRow) return undefined;

    return {
      id: manualRow.id,
      slug: manualRow.slug,
      title: manualRow.title,
      subtitle: manualRow.subtitle ?? "",
      createdAt: manualRow.createdAt.toISOString(),
      sections: buildSectionTree(manualRow.sections),
    };
  },
);

export type SearchableItem = {
  id: string;
  title: string;
  href: string;
  categoryLabel: string;
};

// Sidebar search — flat list across every category for the caller's active
// org, grouped client-side by categoryLabel. Every route that reaches this
// requires a session (see proxy.ts).
export async function getSearchableCatalogItems(): Promise<SearchableItem[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) return [];

  const rows = await db
    .select({
      id: manual.id,
      slug: manual.slug,
      title: manual.title,
      categorySlug: category.slug,
      categoryLabel: category.label,
      categoryRank: category.rank,
    })
    .from(manual)
    .innerJoin(category, eq(manual.categoryId, category.id))
    .where(eq(manual.organizationId, organizationId))
    .orderBy(asc(category.rank), asc(manual.rank));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    href: `/${r.categorySlug}/${r.slug}`,
    categoryLabel: r.categoryLabel,
  }));
}

export type ResolvedCatalogItem = {
  id: string;
  title: string;
  href: string;
  description?: string;
  createdAt?: string;
  rank: string;
};

// The category page ([category]/page.tsx) item grid — same DB source the
// sidebar subitems use, so the grid never shows a different list than
// what's actually clickable in the sidebar for the same category. Already
// in rank order (getManualsForCategory), which is what the grid's
// drag-and-drop reorders.
export async function getResolvedItemsForCategory(
  categorySlug: string,
  categoryHref: string,
): Promise<ResolvedCatalogItem[]> {
  const categoryRow = await getDbCategoryBySlug(categorySlug);
  if (!categoryRow) return [];

  const dbManuals = await getManualsForCategory(categoryRow.id);
  return dbManuals.map((m) => ({
    id: m.id,
    title: m.title,
    href: `${categoryHref}/${m.slug}`,
    description: m.subtitle ?? undefined,
    createdAt: m.createdAt.toISOString(),
    rank: m.rank,
  }));
}
