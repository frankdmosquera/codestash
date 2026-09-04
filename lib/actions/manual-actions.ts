"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, manual } from "@/lib/db/schema/app-schema";
import type { ContentBlock, Manual, ManualSection } from "@/lib/data/types";

export type DbManualRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
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
      createdAt: manual.createdAt,
    })
    .from(manual)
    .where(and(eq(manual.organizationId, organizationId), eq(manual.categoryId, categoryId)))
    .orderBy(asc(manual.title));
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
    .orderBy(asc(category.rank), asc(manual.title));

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
};

// The category page ([category]/page.tsx) item grid — same DB source the
// sidebar subitems use, so the grid never shows a different list than
// what's actually clickable in the sidebar for the same category.
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
  }));
}
