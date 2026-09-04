import type { ReactNode } from "react";
import type { ManualSection } from "@/lib/data/types";
import { CodeBlock } from "@/components/code-block";
import { parseInline } from "./parse-inline";
import { flattenText } from "./flatten-text";

// A ManualSection with its blocks already rendered to markup (server-side —
// CodeBlock, parseInline, etc. never need to ship to the client) plus a
// precomputed lowercase search string, so the client accordion only needs
// to own open/close state and a plain string filter, not block rendering.
export type RenderedSection = {
  id: string;
  number: string;
  title: string;
  content: ReactNode;
  ownSearchText: string;
  children?: RenderedSection[];
};

function renderBlocks(section: ManualSection): ReactNode {
  return (
    <div className="text-base text-gray-800 px-2 mt-8">
      {section.blocks?.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="px-2 leading-relaxed">
              {parseInline(block.text)}
            </p>
          );
        }
        if (block.type === "note") {
          return (
            <p key={i} className="px-2 leading-relaxed text-muted-foreground/80 italic">
              {parseInline(block.text)}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 leading-relaxed">
              {block.items.map((item, j) => (
                <li key={j}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "code") {
          return <CodeBlock key={i} code={block.code} />;
        }
        return null;
      })}
    </div>
  );
}

function ownSearchText(section: ManualSection): string {
  return [
    section.title,
    ...(section.blocks?.map((b) =>
      b.type === "list" ? b.items.join(" ") : flattenText(b.type === "code" ? b.code : b.text),
    ) ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

export function buildRenderedSections(sections: ManualSection[]): RenderedSection[] {
  return sections.map((section) => ({
    id: section.id,
    number: section.number,
    title: section.title,
    content: renderBlocks(section),
    ownSearchText: ownSearchText(section),
    children: section.children ? buildRenderedSections(section.children) : undefined,
  }));
}
