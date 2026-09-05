import type { Manual } from "@/lib/data/types";
import type { PlanLimits } from "@/lib/config/plan-limits";
import { buildRenderedSections } from "@/lib/helpers/build-rendered-sections";
import { toEditableSections } from "@/lib/helpers/manual-edit-compat";
import { EditManualDialog } from "./edit-manual-dialog";
import { DeleteManualDialog } from "./delete-manual-dialog";
import { ShareManualDialog } from "./share-manual-dialog";
import { ManualPageClient } from "./manual-page-client";

// Server Component — renders every section's blocks (and search text)
// server-side via buildRenderedSections, then hands that plus the title
// to the client shell, which owns only search/expand-collapse state.
export function ManualPage({
  manual,
  categorySlug,
  planLimits,
}: {
  manual: Manual;
  categorySlug: string;
  planLimits: PlanLimits;
}) {
  const editableSections = toEditableSections(manual.sections, planLimits.maxNestingDepth);

  return (
    <ManualPageClient
      title={manual.title}
      sections={buildRenderedSections(manual.sections)}
      editAction={
        <div className="flex gap-2">
          {editableSections && (
            <EditManualDialog
              manualId={manual.id}
              initialTitle={manual.title}
              initialSubtitle={manual.subtitle}
              initialSections={editableSections}
              isSnippetShaped={false}
              planLimits={planLimits}
            />
          )}
          <DeleteManualDialog manualId={manual.id} title={manual.title} categorySlug={categorySlug} />
          <ShareManualDialog manualId={manual.id} />
        </div>
      }
    />
  );
}
