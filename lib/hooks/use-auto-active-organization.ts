import { useEffect, useRef } from "react";
import { authClient, useSession } from "@/lib/auth-client";

// Better Auth has no built-in fallback for `session.activeOrganizationId`
// — if it's unset, useActiveOrganization() returns nothing active, even
// for a user who belongs to exactly one workspace (the common case here).
// This fills that gap: once signed in, if nothing's active yet and the
// user has exactly one membership, make it active automatically. Runs
// once per unset-active-org state, not on every render.
export function useAutoActiveOrganization() {
  const { data: session } = useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending: activePending } =
    authClient.useActiveOrganization();
  const attempted = useRef(false);

  useEffect(() => {
    if (!session || activePending || activeOrganization) {
      attempted.current = false;
      return;
    }
    if (attempted.current) return;
    if (!organizations || organizations.length !== 1) return;

    attempted.current = true;
    authClient.organization.setActive({ organizationId: organizations[0].id });
  }, [session, organizations, activeOrganization, activePending]);
}
