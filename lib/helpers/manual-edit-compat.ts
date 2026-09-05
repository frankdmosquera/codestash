import type { ManualSection } from "@/lib/data/types";
import type { ManualSectionInput } from "@/lib/validations/manual-validation";

// The edit form now supports nesting (flattened to depth-tagged rows, see
// manual-validation.ts), but still only one block per section — a
// paragraph or a code snippet, never both, no "list"/"note" blocks. A
// manual whose real structure doesn't match that (multi-block sections,
// or nesting deeper than this org's plan allows — maxNestingDepth now
// scales by plan, see ROLES-AND-BILLING-PLAN.md #7, so the caller passes
// its own resolved planLimits.maxNestingDepth in) would silently lose
// that structure if saved through this form — so callers check this
// before offering an edit entry point at all, rather than offering an
// edit that can quietly destroy content.
export function toEditableSections(
  sections: ManualSection[],
  maxNestingDepth: number,
): ManualSectionInput[] | undefined {
  const result: ManualSectionInput[] = [];

  function walk(nodes: ManualSection[], depth: number): boolean {
    if (depth > maxNestingDepth - 1) return false;
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
