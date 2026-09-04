"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema/auth-schema";

// Server-side equivalent of authClient.useActiveOrganization() for the
// members list — lets /workspace/members render the (static) member and
// invitation lists server-side, leaving only the invite form itself as
// client. Returns null if there's no session or no active organization.
export async function getActiveOrganizationDetails() {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;
  if (!organizationId) return null;

  return auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId },
  });
}

// A seat is any active member, owner included (see
// md-docs/roadmap/01-foundations.md — the owner occupies seat 1, not a
// free extra slot on top of the plan's count). Pure count, no plan-limit
// dependency — actually *capping* invites against a plan's seat
// allowance needs lib/config/plan-limits.ts, which is blocked on the
// Plan B/C pricing numbers still TBD in ROLES-AND-BILLING-PLAN.md. This
// is deliberately just the count, not the enforcement.
export async function getSeatUsage(organizationId: string): Promise<number> {
  const rows = await db
    .select({ id: member.id })
    .from(member)
    .where(eq(member.organizationId, organizationId));
  return rows.length;
}
