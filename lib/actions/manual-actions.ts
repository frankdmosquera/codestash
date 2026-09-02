"use server";

import { cache } from "react";
import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category, manual } from "@/lib/db/schema/app-schema";
import type { ContentBlock } from "@/lib/data/types";

export type DbManualRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  createdAt: Date;
};

// Sidebar subitems for a DB-backed category — scoped to the caller's active
// org so one workspace never sees another's manuals.
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

export type DbManualWithSections = DbManualRow & {
  sections: { id: string; title: string; blocks: ContentBlock[] }[];
};

// Resolves a DB-backed manual for the [category]/[subpage] route — checked
// only after the static catalog comes up empty for that slug. Wrapped in
// `cache` since generateMetadata and the page component both need it for
// the same request.
export const getManualBySlug = cache(
  async (categorySlug: string, manualSlug: string): Promise<DbManualWithSections | undefined> => {
    const session = await auth.api.getSession({ headers: await headers() });
    const organizationId = session?.session.activeOrganizationId;
    if (!organizationId) return undefined;

    const categoryRow = await db.query.category.findFirst({
      where: and(eq(category.organizationId, organizationId), eq(category.slug, categorySlug)),
    });
    if (!categoryRow) return undefined;

    const manualRow = await db.query.manual.findFirst({
      where: and(
        eq(manual.organizationId, organizationId),
        eq(manual.categoryId, categoryRow.id),
        eq(manual.slug, manualSlug),
      ),
      with: { sections: true },
    });
    if (!manualRow) return undefined;

    return manualRow as DbManualWithSections;
  },
);
