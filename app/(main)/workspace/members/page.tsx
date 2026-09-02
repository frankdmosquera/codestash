import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { WorkspaceMembers } from "@/components/workspace/workspace-members";

export default async function WorkspaceMembersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Members</h1>
      <p className="mt-2 text-muted-foreground">
        Invite people into your workspace, or see who's already in.
      </p>
      <div className="mt-10">
        <WorkspaceMembers />
      </div>
    </div>
  );
}
