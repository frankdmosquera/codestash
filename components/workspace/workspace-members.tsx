"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { InviteMemberForm } from "./invite-member-form";

export function WorkspaceMembers() {
  const { data: organization, isPending } = authClient.useActiveOrganization();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!organization) {
    return (
      <p className="text-sm text-muted-foreground">
        You don't have a workspace yet.{" "}
        <Link href="/onboarding" className="text-primary underline underline-offset-4">
          Create one
        </Link>
        .
      </p>
    );
  }

  const pendingInvitations = organization.invitations.filter(
    (invitation) => invitation.status === "pending",
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">
          Invite someone
        </h2>
        <div className="mt-3">
          <InviteMemberForm />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground">
          Members ({organization.members.length})
        </h2>
        <ul className="mt-3 space-y-2">
          {organization.members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <Badge variant="secondary">{member.role}</Badge>
            </li>
          ))}
        </ul>
      </section>

      {pendingInvitations.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">
            Pending invitations ({pendingInvitations.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {pendingInvitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <p className="text-sm">{invitation.email}</p>
                <Badge variant="outline">{invitation.role}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
