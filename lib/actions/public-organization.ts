// Server-only helper, not a Server Action itself — only imported by other
// "use server" action files, never called directly from a client
// component, so it doesn't (and, exporting a non-function constant,
// can't) carry the "use server" directive itself.

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema/auth-schema";

// The catalog is public content — a signed-out visitor (or a signed-in user
// with no active workspace) should still see it, not the static fallback.
// Until multi-tenant billing exists (Phase 2), the "public" catalog is just
// this one real organization's shared content. Revisit once a second real
// org exists and "which org is public" becomes a real question.
export const PUBLIC_ORGANIZATION_SLUG = "codestash";

export const getPublicOrganizationId = cache(async (): Promise<string | undefined> => {
  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, PUBLIC_ORGANIZATION_SLUG),
  });
  return org?.id;
});
