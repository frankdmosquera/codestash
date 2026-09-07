"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

// Never offers "owner" as a selectable target here - promoting someone to
// owner is ownership transfer, a bigger, separate action than a plain role
// dropdown should casually allow (same reasoning InviteMemberForm's role
// select already follows: member/admin only). Demoting the sole owner away
// from "owner" (including this member updating themselves) is refused by
// better-auth's own updateMemberRole endpoint before this ever reaches the
// server, so no client-side lockout guard is needed here - the error just
// surfaces via `error.message` same as everywhere else in this app.
export function MemberRoleSelect({
  memberId,
  role,
}: {
  memberId: string;
  role: string;
}) {
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (newRole: "member" | "admin") => {
      const { data, error } = await authClient.organization.updateMemberRole({
        memberId,
        role: newRole,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => router.refresh(),
  });

  if (role === "owner") {
    return <span className="text-sm text-muted-foreground">Owner</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Select
        value={role}
        onValueChange={(value) => mutate(value as "member" | "admin")}
        disabled={isPending}
      >
        <SelectTrigger className="w-28" aria-label="Member role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="member">Member</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
