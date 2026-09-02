import type { ContentBlock } from "@/lib/data/types";
import type { DbManualWithSections } from "@/lib/actions/manual-actions";

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-gray-800">{block.text}</p>;
    case "list":
      return (
        <ul className="list-disc space-y-1 pl-5 text-gray-800">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md bg-neutral-900 p-4 text-sm text-neutral-200">
          <code>{block.code}</code>
        </pre>
      );
    case "note":
      return (
        <p className="rounded-md border border-neutral-200 bg-neutral-100 p-3 text-sm text-gray-700">
          {block.text}
        </p>
      );
  }
}

export function DbManualPage({ manual }: { manual: DbManualWithSections }) {
  return (
    <div className="text-black">
      <div className="bg-secondary-foreground p-3">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
          {manual.title}
        </h1>
        {manual.subtitle && (
          <p className="text-neutral-400">{manual.subtitle}</p>
        )}
      </div>

      <div className="space-y-6 px-2 mt-8">
        {manual.sections.length === 0 && (
          <p className="text-sm text-gray-500">No content yet.</p>
        )}
        {manual.sections.map((section) => (
          <div key={section.id}>
            <h2 className="text-xl font-medium text-gray-900">{section.title}</h2>
            <div className="mt-2 space-y-3">
              {section.blocks.map((block, i) => (
                <ContentBlockView key={i} block={block} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
