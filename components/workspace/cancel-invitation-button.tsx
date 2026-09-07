"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

// No confirm dialog, unlike RemoveMemberDialog - cancelling a pending
// invite is low-stakes and trivially reversible (just re-invite the same
// email), not the same severity as removing an active member.
export function CancelInvitationButton({
  invitationId,
  email,
}: {
  invitationId: string;
  email: string;
}) {
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Cancel invitation to ${email}`}
        disabled={isPending}
        onClick={() => mutate()}
      >
        <X className="size-4" />
      </Button>
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
