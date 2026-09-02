"use server";

import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema/app-schema";

export type DbCategoryRow = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  icon: string;
  backgroundTheme: string;
  rank: string;
};

// Returns [] for a signed-out visitor or a signed-in user with no active
// workspace — callers fall back to the static category list in that case.
// Also [] for a real workspace that just hasn't been seeded with any
// categories yet (no "create category" UI exists yet to have made any).
export async function getCategoriesForActiveOrg(): Promise<DbCategoryRow[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) return [];

  const rows = await db
    .select({
      id: category.id,
      slug: category.slug,
      label: category.label,
      description: category.description,
      icon: category.icon,
      backgroundTheme: category.backgroundTheme,
      rank: category.rank,
    })
    .from(category)
    .where(eq(category.organizationId, organizationId))
    .orderBy(asc(category.rank));

  return rows;
}

// Moves `categoryId` to sit between `beforeRank` and `afterRank` (either
// may be null for "start of list" / "end of list"). Verifies the category
// actually belongs to the caller's active org before writing — the client
// only sends ranks, never trusts them for authorization.
export async function reorderCategoryAction(
  categoryId: string,
  beforeRank: string | null,
  afterRank: string | null,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) {
    throw new Error("No active workspace");
  }

  const newRank = generateKeyBetween(beforeRank, afterRank);

  const updated = await db
    .update(category)
    .set({ rank: newRank })
    .where(
      and(eq(category.id, categoryId), eq(category.organizationId, organizationId)),
    )
    .returning({ id: category.id });

  if (updated.length === 0) {
    throw new Error("Category not found in your active workspace");
  }

  return { rank: newRank };
}
