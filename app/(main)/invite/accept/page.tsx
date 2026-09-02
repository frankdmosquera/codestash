import { notFound } from "next/navigation";

import { AcceptInvitation } from "@/components/workspace/accept-invitation";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <AcceptInvitation invitationId={id} />
      </div>
    </div>
  );
}
