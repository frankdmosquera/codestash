import type { ManualSection } from "@/lib/data/types";
import type { ManualSectionInput } from "@/lib/validations/manual-validation";

// v1's edit form only supports a flat list of sections, each exactly one
// block (a paragraph or a code snippet) — no nesting, no multi-block
// sections, no "list"/"note" blocks. A manual whose real structure doesn't
// match that (e.g. the roadmap/rules manuals, or anything with nested
// sub-sections) would silently lose that structure if saved through this
// form — so callers check this before offering an edit entry point at all,
// rather than offering an edit that can quietly destroy content.
export function toEditableSections(sections: ManualSection[]): ManualSectionInput[] | undefined {
  const result: ManualSectionInput[] = [];
  for (const section of sections) {
    if (section.children?.length) return undefined;
    if (!section.blocks || section.blocks.length !== 1) return undefined;
    const [block] = section.blocks;
    if (block.type === "p") {
      result.push({ title: section.title, kind: "text", content: block.text });
    } else if (block.type === "code") {
      result.push({ title: section.title, kind: "code", content: block.code });
    } else {
      return undefined;
    }
  }
  return result;
}
