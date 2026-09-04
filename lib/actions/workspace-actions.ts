"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

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
