// Server-only helper, not a Server Action itself — same spirit as
// require-org-role.ts. Kept separate from lib/config/plan-limits.ts on
// purpose: that file stays a pure config module (no DB import) so it's
// safe to read from client components too (see manual-form.tsx); this one
// does the DB lookup and belongs only on the server.

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema/auth-schema";
import { getPlanLimits, type PlanLimits } from "@/lib/config/plan-limits";

export async function getOrgPlanLimits(organizationId: string): Promise<PlanLimits> {
  const orgRow = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    columns: { plan: true },
  });
  return getPlanLimits(orgRow?.plan);
}
