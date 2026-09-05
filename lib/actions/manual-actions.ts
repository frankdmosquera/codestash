"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { and, asc, eq, isNull } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, manual, section } from "@/lib/db/schema/app-schema";
import { requireOrgRole } from "@/lib/actions/require-org-role";
import { requireManualShareAccess } from "@/lib/actions/require-manual-share-access";
import { getOrgPlanLimits } from "@/lib/actions/get-org-plan-limits";
import type { PlanLimits } from "@/lib/config/plan-limits";
import { assignSectionParents } from "@/lib/helpers/assign-section-parents";
import { slugify } from "@/lib/utils";
import {
  createManualValidationSchema,
  updateManualValidationSchema,
  type CreateManualValidationInput,
  type UpdateManualValidationInput,
} from "@/lib/validations/manual-validation";
import { buildSectionTree } from "@/lib/helpers/build-section-tree";
import type { ContentBlock, Manual } from "@/lib/data/types";

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
    .where(
      and(
        eq(manual.organizationId, organizationId),
        eq(manual.categoryId, categoryId),
        isNull(manual.deletedAt),
      ),
    )
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

// Soft-deletes a manual (or snippet, same table) — owner/admin only, same
// requireOrgRole pattern as reorderManualAction. Verifies the manual
// actually belongs to the caller's active org in the `where` clause itself,
// not just checked-and-trusted, before writing. Sets `deletedAt` rather
// than removing the row, so the data survives a misclick even though
// there's no restore UI yet.
export async function deleteManualAction(manualId: string) {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);

  const updated = await db
    .update(manual)
    .set({ deletedAt: new Date() })
    .where(and(eq(manual.id, manualId), eq(manual.organizationId, organizationId)))
    .returning({ id: manual.id });

  if (updated.length === 0) {
    throw new Error("Manual not found in your active workspace");
  }
}

// A section is either a paragraph of text or a single code snippet, never
// both — that part of v1's scope is unchanged. What *can* vary now is
// nesting: the form sends a flat, depth-tagged list (see
// manual-validation.ts), converted to real parentId links below via
// assignSectionParents, the same stack-based shape
// scripts/lib/markdown-to-manual-sections.ts uses for markdown headings.
function sectionInputToBlock(input: { kind: "text" | "code"; content: string }): ContentBlock {
  return input.kind === "code" ? { type: "code", code: input.content } : { type: "p", text: input.content };
}

// Four independent checks, not one — nesting deeper should never cost a
// manual its top-level breadth, and per-plan depth/character budgets are
// no longer baked into the Zod schema now that they scale by plan (see
// md-docs/ROLES-AND-BILLING-PLAN.md #7):
//   - maxMainSectionsPerManual caps only depth-0 rows (how many distinct topics)
//   - maxTotalSectionsPerManual caps every row combined (main + nested)
//   - maxNestingDepth caps how deep any single row can go
//   - maxTotalCharsPerManual caps the sum of every section's content —
//     the aggregate flexibility on top of the fixed per-bullet
//     maxCharsPerSection ceiling (already enforced by the Zod schema
//     itself, since that one's the same for every plan)
function assertWithinSectionLimits(
  sections: { depth: number; content: string }[],
  limits: Pick<
    PlanLimits,
    "maxMainSectionsPerManual" | "maxTotalSectionsPerManual" | "maxNestingDepth" | "maxTotalCharsPerManual"
  >,
) {
  const mainCount = sections.filter((s) => s.depth === 0).length;
  if (limits.maxMainSectionsPerManual !== null && mainCount > limits.maxMainSectionsPerManual) {
    throw new Error(`This plan allows up to ${limits.maxMainSectionsPerManual} sections per manual`);
  }
  if (limits.maxTotalSectionsPerManual !== null && sections.length > limits.maxTotalSectionsPerManual) {
    throw new Error(`This plan allows up to ${limits.maxTotalSectionsPerManual} bullets total per manual`);
  }
  const deepestDepth = Math.max(0, ...sections.map((s) => s.depth));
  if (deepestDepth > limits.maxNestingDepth - 1) {
    throw new Error(`This plan allows nesting up to ${limits.maxNestingDepth} levels deep`);
  }
  const totalChars = sections.reduce((sum, s) => sum + s.content.length, 0);
  if (limits.maxTotalCharsPerManual !== null && totalChars > limits.maxTotalCharsPerManual) {
    throw new Error(`This plan allows up to ${limits.maxTotalCharsPerManual.toLocaleString()} characters total per manual`);
  }
}

// Inserts a flat, depth-tagged section list as real tree rows. Rank is
// tracked per parent group (a Map keyed by parentIndex, `null` meaning
// top-level) so siblings under the same parent get ordered ranks relative
// to each other, not to the whole flat list — inserting a child under the
// 3rd top-level section must never touch the top-level ranks.
async function insertSectionTree(manualId: string, sections: { title: string; kind: "text" | "code"; content: string; depth: number }[]) {
  const withParents = assignSectionParents(sections);
  const idByIndex = sections.map(() => crypto.randomUUID());
  const lastRankByParent = new Map<number | null, string | null>();

  for (let i = 0; i < withParents.length; i++) {
    const { input, parentIndex } = withParents[i];
    const prevRank = lastRankByParent.get(parentIndex) ?? null;
    const rank = generateKeyBetween(prevRank, null);
    lastRankByParent.set(parentIndex, rank);

    await db.insert(section).values({
      id: idByIndex[i],
      manualId,
      parentId: parentIndex !== null ? idByIndex[parentIndex] : null,
      rank,
      title: input.title,
      blocks: [sectionInputToBlock(input)],
    });
  }
}

// Creates a manual (+ its section tree) in the caller's active workspace —
// owner/admin only, same as category creation. Verifies the target
// category actually belongs to the caller's org before writing — the
// client only sends a categoryId, never trusted for authorization. Also
// enforces the plan's main/total section caps — the two content-structure
// limits that actually scale by plan (see md-docs/ROLES-AND-BILLING-PLAN.md #7);
// depth and per-section length are enforced by the Zod schema itself,
// since those are the same for every plan.
export async function createManualAction(input: CreateManualValidationInput) {
  const { organizationId, userId } = await requireOrgRole(["owner", "admin"]);
  const { categoryId, title, subtitle, sections } = createManualValidationSchema.parse(input);

  const limits = await getOrgPlanLimits(organizationId);
  assertWithinSectionLimits(sections, limits);

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

  await insertSectionTree(manualId, sections);

  return { id: manualId, slug };
}

// Replaces a manual's title/subtitle/sections wholesale — same
// "delete-then-reinsert" pattern the doc-family sync scripts use, simplest
// correct option given the whole tree changes shape on every save anyway.
// Deliberately never changes the slug (even if the title does) so existing
// links to this manual never break on edit.
//
// Two independent ways in: an org owner/admin (the normal case), or someone
// with no org membership at all who has an "edit"-level manual_share for
// this exact manual (see share-manual-dialog.tsx / requireManualShareAccess).
// Org auth is tried first since it's the common path; only falls back to
// the share check if that fails, rather than requiring both. Either way,
// maxSectionsPerManual is enforced against the *manual's own org's* plan —
// not the editor's (a shared-with-edit-permission outsider may have no org
// at all) — since the limit is about how much the owning workspace holds,
// not who happens to be editing it right now.
export async function updateManualAction(input: UpdateManualValidationInput) {
  const { manualId, title, subtitle, sections: sectionInputs } = updateManualValidationSchema.parse(input);

  let existingManual: { id: string; slug: string; organizationId: string } | undefined;
  try {
    const { organizationId } = await requireOrgRole(["owner", "admin"]);
    existingManual = await db.query.manual.findFirst({
      where: and(eq(manual.id, manualId), eq(manual.organizationId, organizationId)),
      columns: { id: true, slug: true, organizationId: true },
    });
  } catch {
    await requireManualShareAccess(manualId, "edit");
    existingManual = await db.query.manual.findFirst({
      where: eq(manual.id, manualId),
      columns: { id: true, slug: true, organizationId: true },
    });
  }
  if (!existingManual) {
    throw new Error("Manual not found");
  }

  const limits = await getOrgPlanLimits(existingManual.organizationId);
  assertWithinSectionLimits(sectionInputs, limits);

  await db.update(manual).set({ title, subtitle: subtitle || null }).where(eq(manual.id, manualId));
  await db.delete(section).where(eq(section.manualId, manualId));

  await insertSectionTree(manualId, sectionInputs);

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
      where: and(
        eq(manual.categoryId, categoryRow.id),
        eq(manual.slug, manualSlug),
        isNull(manual.deletedAt),
      ),
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
    .where(and(eq(manual.organizationId, organizationId), isNull(manual.deletedAt)))
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
