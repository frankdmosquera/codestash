"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ManualSection } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/code-block";
import { flattenText } from "@/lib/helpers/flatten-text";
import { parseInline } from "@/lib/helpers/parse-inline";

// One tint per nesting depth. Cycles if you ever nest deeper than 3 levels.
// Each is a light wash of --primary at increasing opacity, so depth reads
// as "getting more specific" rather than a jarring color change.
const DEPTH_TINTS = ["bg-teal-300", "bg-teal-200", "bg-teal-100", "bg-teal-50"];
// bg
export function sectionMatches(section: ManualSection, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();

  const haystack = [
    section.title,
    ...(section.blocks?.map((b) =>
      b.type === "list"
        ? b.items.join(" ")
        : flattenText(b.type === "code" ? b.code : b.text),
    ) ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes(q)) return true;
  return (section.children ?? []).some((child) => sectionMatches(child, query));
}

function SectionBlocks({ section }: { section: ManualSection }) {
  return (
    <div className="text-base text-gray-800 px-2 mt-8  ">
      {section.blocks?.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="px-2  leading-relaxed ">
              {parseInline(block.text)}
            </p>
          );
        }
        if (block.type === "note") {
          return (
            <p
              key={i}
              className="px-2  leading-relaxed text-muted-foreground/80 italic"
            >
              {parseInline(block.text)}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 leading-relaxed ">
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

/**
 * Renders one level of manual sections as an Accordion. Recurses into
 * `section.children` for nested items (2 -> 2.1, 2.2 ...), reusing the
 * same global `openIds` set so expand/collapse-all and search work
 * across every nesting level at once. `depth` drives the background
 * tint — each level of nesting gets a slightly stronger wash.
 *
 * NOTE: this assumes the generated components/ui/accordion.tsx exposes
 * a controlled `value`/`onValueChange` pair as string[] (multiple items
 * can be open at once) — double check that against your actual
 * generated file if props don't line up.
 */
export function ManualAccordion({
  sections,
  openIds,
  onOpenChange,
  query,
  depth = 0,
}: {
  sections: ManualSection[];
  openIds: Set<string>;
  onOpenChange: (next: Set<string>) => void;
  query: string;
  depth?: number;
}) {
  const visible = sections.filter((s) => sectionMatches(s, query));
  const value = sections
    .map((s) => s.id)
    .filter((id) => (query ? true : openIds.has(id)));

  function handleValueChange(newValue: string[]) {
    const idsAtThisLevel = new Set(sections.map((s) => s.id));
    const next = new Set(openIds);
    idsAtThisLevel.forEach((id) => next.delete(id));
    newValue.forEach((id) => next.add(id));
    onOpenChange(next);
  }

  if (visible.length === 0) return null;

  const tint = DEPTH_TINTS[depth % DEPTH_TINTS.length];

  return (
    <Accordion
      value={value}
      onValueChange={handleValueChange}
      className={"p-2  "}
    >
      {visible.map((section) => {
        const isOpen = value.includes(section.id);
        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className={cn(
              "rounded-md transition-colors",
              isOpen && tint,
              query && "",
            )}
          >
            <AccordionTrigger className={"text-base  "}>
              <span className="mr-2 b font-mono text-base text-muted-foreground">
                {section.number}
              </span>
              {section.title}
            </AccordionTrigger>
            <AccordionContent className={""}>
              <SectionBlocks section={section} />
              {section.children && (
                <div className="border-l">
                  <ManualAccordion
                    sections={section.children}
                    openIds={openIds}
                    onOpenChange={onOpenChange}
                    query={query}
                    depth={depth + 1}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
