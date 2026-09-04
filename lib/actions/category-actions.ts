"use server";

import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema/app-schema";
import { getPublicOrganizationId } from "@/lib/actions/public-organization";
import { requireOrgRole } from "@/lib/actions/require-org-role";
import { slugify } from "@/lib/utils";
import {
  createCategoryValidationSchema,
  type CreateCategoryValidationInput,
} from "@/lib/validations/category-validation";

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

// Read-only counterpart for a signed-out visitor (or a signed-in user with
// no active workspace) — the sidebar and category pages should still show
// the real catalog, not the static fallback, just without drag-to-reorder
// (reorderCategoryAction requires a real active-org session regardless).
export async function getPublicCategories(): Promise<DbCategoryRow[]> {
  const organizationId = await getPublicOrganizationId();
  if (!organizationId) return [];

  return db
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
}

// Moves `categoryId` to sit between `beforeRank` and `afterRank` (either
// may be null for "start of list" / "end of list"). Reordering the
// workspace's own category structure is an owner/admin action, not
// something a non-paying member gets to do. Verifies the category
// actually belongs to the caller's active org before writing — the client
// only sends ranks, never trusts them for authorization.
export async function reorderCategoryAction(
  categoryId: string,
  beforeRank: string | null,
  afterRank: string | null,
) {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);

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

// Creates a category in the caller's active workspace — owner/admin only,
// same as reordering. Icon and background stay at the schema's own
// defaults (a plain "BookOpen" icon, "default" theme) — the icon/theme
// picker is deliberately future work, not this pass.
export async function createCategoryAction(input: CreateCategoryValidationInput) {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);
  const { label } = createCategoryValidationSchema.parse(input);
  const slug = slugify(label);
  if (!slug) {
    throw new Error("That name doesn't produce a usable URL slug");
  }

  const existing = await db.query.category.findFirst({
    where: and(eq(category.organizationId, organizationId), eq(category.slug, slug)),
  });
  if (existing) {
    throw new Error(`A category named "${label}" already exists`);
  }

  const siblings = await db
    .select({ rank: category.rank })
    .from(category)
    .where(eq(category.organizationId, organizationId))
    .orderBy(asc(category.rank));
  const lastRank = siblings.at(-1)?.rank ?? null;
  const rank = generateKeyBetween(lastRank, null);

  const [created] = await db
    .insert(category)
    .values({
      id: crypto.randomUUID(),
      organizationId,
      slug,
      label,
      rank,
    })
    .returning({
      id: category.id,
      slug: category.slug,
      label: category.label,
      description: category.description,
      icon: category.icon,
      backgroundTheme: category.backgroundTheme,
      rank: category.rank,
    });

  return created;
}
