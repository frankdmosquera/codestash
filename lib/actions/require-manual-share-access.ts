// Server-only helper, not a Server Action itself — same pattern as
// require-org-role.ts, just for the other access path: a manual_share row
// instead of org membership. Deliberately never touches
// session.activeOrganizationId — a shared-with person may belong to no
// organization at all, or a different one than whoever shared the doc, and
// none of that should matter here.

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { manualShare } from "@/lib/db/schema/app-schema";

export type ManualSharePermission = "view" | "edit";

const PERMISSION_RANK: Record<ManualSharePermission, number> = { view: 1, edit: 2 };

export type RequireManualShareAccessResult = {
  userId: string;
  email: string;
  permission: ManualSharePermission;
};

// Throws if there's no session, or no manual_share row for this manual
// matching the caller's email at or above `minPermission`. Case-sensitive
// exact match on email, same as better-auth's own invitation check
// (YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION) — no normalization, since
// shareManualAction stores whatever the inviter typed.
export async function requireManualShareAccess(
  manualId: string,
  minPermission: ManualSharePermission,
): Promise<RequireManualShareAccessResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Sign in to view this");
  }

  const shareRow = await db.query.manualShare.findFirst({
    where: and(eq(manualShare.manualId, manualId), eq(manualShare.email, session.user.email)),
  });

  if (!shareRow || PERMISSION_RANK[shareRow.permission] < PERMISSION_RANK[minPermission]) {
    throw new Error("This manual hasn't been shared with you");
  }

  return { userId: session.user.id, email: session.user.email, permission: shareRow.permission };
}
