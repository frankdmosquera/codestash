"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";

export function AcceptInvitation({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const {
    data: invitation,
    isPending: isInvitationPending,
    error: invitationError,
  } = useQuery({
    queryKey: ["invitation", invitationId, session?.user.id],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getInvitation({
        query: { id: invitationId },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.organization.rejectInvitation({
        invitationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  if (isSessionPending) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!session) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in to accept</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            This invitation was sent to a specific email address — sign in
            (or create an account) with that email, then come back to this
            link to accept.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/sign-in" className="text-primary underline underline-offset-4">
              Sign in
            </Link>
            <Link href="/sign-up" className="text-primary underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isInvitationPending) {
    return <p className="text-sm text-muted-foreground">Loading invitation...</p>;
  }

  if (invitationError || !invitation) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Invitation not found</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {invitationError?.message ??
            "This invitation is invalid, expired, or was sent to a different email address."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          Join {invitation.organizationName}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        <p>
          {invitation.inviterEmail} invited you as{" "}
          <span className="font-medium text-foreground">{invitation.role}</span>.
        </p>
        {(acceptMutation.error ?? rejectMutation.error) && (
          <p className="mt-3 text-destructive">
            {(acceptMutation.error ?? rejectMutation.error)?.message}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => rejectMutation.mutate()}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
          >
            Decline
          </Button>
          <Button
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
          >
            {acceptMutation.isPending ? "Joining..." : "Accept"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
