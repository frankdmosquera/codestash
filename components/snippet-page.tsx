import type { Snippet } from "@/lib/data/types";
import type { PlanLimits } from "@/lib/config/plan-limits";
import { CodeBlock } from "@/components/code-block";
import { EditManualDialog } from "@/components/manuals/edit-manual-dialog";
import { DeleteManualDialog } from "@/components/manuals/delete-manual-dialog";
import { ShareManualDialog } from "@/components/manuals/share-manual-dialog";

// Always exactly one section/one code block by construction (that's the
// definition of a snippet — see toSnippet in [category]/[subpage]/page.tsx)
// so, unlike ManualPage, there's no compatibility check needed before
// offering the edit entry point.
export function SnippetPage({
  snippet,
  categorySlug,
  planLimits,
}: {
  snippet: Snippet;
  categorySlug: string;
  planLimits: PlanLimits;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {snippet.title}
        </h1>
        <div className="flex gap-2">
          <EditManualDialog
            manualId={snippet.id}
            initialTitle={snippet.title}
            initialSubtitle={snippet.description ?? ""}
            initialSections={[{ title: snippet.title, kind: "code", content: snippet.code, depth: 0 }]}
            isSnippetShaped
            planLimits={planLimits}
          />
          <DeleteManualDialog manualId={snippet.id} title={snippet.title} categorySlug={categorySlug} />
          <ShareManualDialog manualId={snippet.id} />
        </div>
      </div>
      {snippet.description && (
        <p className="mt-2 max-w-xl text-neutral-300">{snippet.description}</p>
      )}
      <div className="mt-8">
        <CodeBlock code={snippet.code} />
      </div>
    </div>
  );
}
