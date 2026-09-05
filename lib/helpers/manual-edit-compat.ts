import type { ManualSection } from "@/lib/data/types";
import type { ManualSectionInput } from "@/lib/validations/manual-validation";
import { CONTENT_STRUCTURE_LIMITS } from "@/lib/config/plan-limits";

// The edit form now supports nesting (flattened to depth-tagged rows, see
// manual-validation.ts), but still only one block per section — a
// paragraph or a code snippet, never both, no "list"/"note" blocks. A
// manual whose real structure doesn't match that (multi-block sections,
// or nesting deeper than CONTENT_STRUCTURE_LIMITS.maxNestingDepth allows)
// would silently lose that structure if saved through this form — so
// callers check this before offering an edit entry point at all, rather
// than offering an edit that can quietly destroy content.
export function toEditableSections(sections: ManualSection[]): ManualSectionInput[] | undefined {
  const result: ManualSectionInput[] = [];

  function walk(nodes: ManualSection[], depth: number): boolean {
    if (depth > CONTENT_STRUCTURE_LIMITS.maxNestingDepth - 1) return false;
    for (const section of nodes) {
      if (!section.blocks || section.blocks.length !== 1) return false;
      const [block] = section.blocks;
      if (block.type === "p") {
        result.push({ title: section.title, kind: "text", content: block.text, depth });
      } else if (block.type === "code") {
        result.push({ title: section.title, kind: "code", content: block.code, depth });
      } else {
        return false;
      }
      if (section.children?.length && !walk(section.children, depth + 1)) {
        return false;
      }
    }
    return true;
  }

  return walk(sections, 0) ? result : undefined;
}
