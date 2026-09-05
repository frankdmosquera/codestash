import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getSharedManual } from "@/lib/actions/manual-share-actions";
import { buildRenderedSections } from "@/lib/helpers/build-rendered-sections";
import { toEditableSections } from "@/lib/helpers/manual-edit-compat";
import { ManualPageClient } from "@/components/manuals/manual-page-client";
import { EditManualDialog } from "@/components/manuals/edit-manual-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Deliberately excluded from proxy.ts's blanket sign-in redirect (see the
// matcher there) so a shared-doc link works cold, for someone with no
// session yet — same reasoning as /invite/accept. Access itself comes
// entirely from getSharedManual → requireManualShareAccess, never from
// session.activeOrganizationId; a signed-in visitor with zero (or a
// completely different) organization still sees this page fine as long as
// their email matches a manual_share row.
export default async function SharedManualPage({
  params,
}: PageProps<"/shared/[manualId]">) {
  const { manualId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <div className="mx-auto max-w-sm px-6 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in to view this</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              This document was shared with a specific email address — sign
              in (or create an account) with that email, then come back to
              this link.
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
      </div>
    );
  }

  let sharedManual: Awaited<ReturnType<typeof getSharedManual>> | undefined;
  let errorMessage: string | undefined;
  try {
    sharedManual = await getSharedManual(manualId);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Something went wrong.";
  }

  if (!sharedManual) {
    return (
      <div className="mx-auto max-w-sm px-6 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Can&apos;t open this</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            {errorMessage}
          </CardContent>
        </Card>
      </div>
    );
  }

  const editableSections =
    sharedManual.permission === "edit"
      ? toEditableSections(sharedManual.sections, sharedManual.planLimits.maxNestingDepth)
      : undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ManualPageClient
        title={sharedManual.title}
        sections={buildRenderedSections(sharedManual.sections)}
        editAction={
          editableSections && (
            <EditManualDialog
              manualId={sharedManual.id}
              initialTitle={sharedManual.title}
              initialSubtitle={sharedManual.subtitle}
              initialSections={editableSections}
              isSnippetShaped={false}
              planLimits={sharedManual.planLimits}
            />
          )
        }
      />
    </div>
  );
}
