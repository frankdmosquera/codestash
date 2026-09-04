import type { Manual } from "@/lib/data/types";
import { buildRenderedSections } from "@/lib/helpers/build-rendered-sections";
import { ManualPageClient } from "./manual-page-client";

// Server Component — renders every section's blocks (and search text)
// server-side via buildRenderedSections, then hands that plus the title
// to the client shell, which owns only search/expand-collapse state.
export function ManualPage({ manual }: { manual: Manual }) {
  return (
    <ManualPageClient
      title={manual.title}
      sections={buildRenderedSections(manual.sections)}
    />
  );
}
