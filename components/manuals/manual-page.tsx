import type { Manual } from "@/lib/data/types";
import { buildRenderedSections } from "@/lib/helpers/build-rendered-sections";
import { toEditableSections } from "@/lib/helpers/manual-edit-compat";
import { EditManualDialog } from "./edit-manual-dialog";
import { ManualPageClient } from "./manual-page-client";

// Server Component — renders every section's blocks (and search text)
// server-side via buildRenderedSections, then hands that plus the title
// to the client shell, which owns only search/expand-collapse state.
export function ManualPage({ manual }: { manual: Manual }) {
  const editableSections = toEditableSections(manual.sections);

  return (
    <ManualPageClient
      title={manual.title}
      sections={buildRenderedSections(manual.sections)}
      editAction={
        editableSections && (
          <EditManualDialog
            manualId={manual.id}
            initialTitle={manual.title}
            initialSubtitle={manual.subtitle}
            initialSections={editableSections}
            isSnippetShaped={false}
          />
        )
      }
    />
  );
}
