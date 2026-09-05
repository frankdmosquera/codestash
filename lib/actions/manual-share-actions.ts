"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { manual, manualShare } from "@/lib/db/schema/app-schema";
import { requireOrgRole } from "@/lib/actions/require-org-role";
import { requireManualShareAccess, type ManualSharePermission } from "@/lib/actions/require-manual-share-access";
import { getOrgPlanLimits } from "@/lib/actions/get-org-plan-limits";
import { buildSectionTree } from "@/lib/helpers/build-section-tree";
import {
  shareManualValidationSchema,
  type ShareManualValidationInput,
} from "@/lib/validations/manual-share-validation";
import type { Manual } from "@/lib/data/types";
import type { PlanLimits } from "@/lib/config/plan-limits";

export type ManualShareRow = {
  id: string;
  email: string;
  permission: "view" | "edit";
  createdAt: Date;
};

// Grants (or updates) one email's access to one manual — owner/admin only,
// same requireOrgRole pattern as every other org-scoped write. Verifies the
// manual actually belongs to the caller's org before writing. Sharing again
// with an email that already has access just updates its permission
// (the unique index on manualId+email makes this an upsert, not a duplicate).
export async function shareManualAction(input: ShareManualValidationInput) {
  const { organizationId, userId } = await requireOrgRole(["owner", "admin"]);
  const { manualId, email, permission } = shareManualValidationSchema.parse(input);

  const manualRow = await db.query.manual.findFirst({
    where: and(eq(manual.id, manualId), eq(manual.organizationId, organizationId)),
  });
  if (!manualRow) {
    throw new Error("Manual not found in your active workspace");
  }

  await db
    .insert(manualShare)
    .values({
      id: crypto.randomUUID(),
      manualId,
      email,
      permission,
      invitedByUserId: userId,
    })
    .onConflictDoUpdate({
      target: [manualShare.manualId, manualShare.email],
      set: { permission },
    });
}

// Revokes one share — owner/admin only. Verifies the share's manual belongs
// to the caller's org before deleting, not just checked-and-trusted, same
// spirit as deleteManualAction (looked up via the relation rather than a
// raw subquery, since a share row only carries manualId, not organizationId
// itself).
export async function revokeManualShareAction(shareId: string) {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);

  const shareRow = await db.query.manualShare.findFirst({
    where: eq(manualShare.id, shareId),
    with: { manual: true },
  });
  if (!shareRow || shareRow.manual.organizationId !== organizationId) {
    throw new Error("Share not found in your active workspace");
  }

  await db.delete(manualShare).where(eq(manualShare.id, shareId));
}

// Lists current shares for a manual — owner/admin only, for the Share
// dialog's management list. Verifies org ownership the same way every other
// read in this file does before returning anything.
export async function getSharesForManual(manualId: string): Promise<ManualShareRow[]> {
  const { organizationId } = await requireOrgRole(["owner", "admin"]);

  const manualRow = await db.query.manual.findFirst({
    where: and(eq(manual.id, manualId), eq(manual.organizationId, organizationId)),
  });
  if (!manualRow) {
    throw new Error("Manual not found in your active workspace");
  }

  return db.query.manualShare.findMany({
    where: eq(manualShare.manualId, manualId),
    columns: { id: true, email: true, permission: true, createdAt: true },
  });
}

export type SharedManual = Manual & { permission: ManualSharePermission; planLimits: PlanLimits };

// The read path for someone who isn't an org member at all — access comes
// entirely from requireManualShareAccess, called first and unconditionally,
// never from session.activeOrganizationId. Callable by anyone signed in
// with any manualId (every export from a "use server" file is a public
// endpoint), which is exactly why the access check has to be the first
// line, not an afterthought. planLimits is resolved from the manual's
// *owning org* here, not the viewer's (who may have none) — same
// reasoning as updateManualAction's plan-limit check.
export async function getSharedManual(manualId: string): Promise<SharedManual> {
  const { permission } = await requireManualShareAccess(manualId, "view");

  const manualRow = await db.query.manual.findFirst({
    where: eq(manual.id, manualId),
    with: { sections: true },
  });
  if (!manualRow) {
    throw new Error("This manual no longer exists");
  }

  const planLimits = await getOrgPlanLimits(manualRow.organizationId);

  return {
    id: manualRow.id,
    slug: manualRow.slug,
    title: manualRow.title,
    subtitle: manualRow.subtitle ?? "",
    createdAt: manualRow.createdAt.toISOString(),
    sections: buildSectionTree(manualRow.sections),
    permission,
    planLimits,
  };
}
