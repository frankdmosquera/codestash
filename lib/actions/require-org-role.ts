// Server-only helper, not a Server Action itself — same reasoning as
// public-organization.ts: only ever called from other "use server" action
// files, never directly from a client component.
//
// The one reusable permission-check helper every org-scoped *write*
// should call first (see md-docs/roadmap/01-foundations.md) — reads stay
// on the public-org fallback in manual-actions.ts/category-actions.ts,
// this is specifically for actions that mutate something and need to
// know the caller is actually allowed to.

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema/auth-schema";

export type OrgRole = "owner" | "admin" | "member";

export type RequireOrgRoleResult = {
  userId: string;
  organizationId: string;
  role: OrgRole;
};

// Throws if there's no session, no active workspace, or the caller's role
// in that workspace isn't one of `allowedRoles` — so a caller never has to
// remember to check a falsy return value, only to call this first.
export async function requireOrgRole(
  allowedRoles: OrgRole[],
): Promise<RequireOrgRoleResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!session || !organizationId) {
    throw new Error("No active workspace");
  }

  const memberRow = await db.query.member.findFirst({
    where: and(eq(member.organizationId, organizationId), eq(member.userId, session.user.id)),
  });
  const role = memberRow?.role as OrgRole | undefined;
  if (!role || !allowedRoles.includes(role)) {
    throw new Error("You don't have permission to do this");
  }

  return { userId: session.user.id, organizationId, role };
}
