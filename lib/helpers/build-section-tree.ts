import type { ContentBlock, ManualSection } from "@/lib/data/types";

export type FlatSectionRow = {
  id: string;
  parentId: string | null;
  rank: string;
  title: string;
  blocks: unknown;
};

// Sections are stored flat with parentId + rank (see section-schema.ts) —
// the dotted "1.2" numbering is computed here by walking the tree in rank
// order, never stored, so reordering or inserting a section never touches
// its siblings' numbers. Shared by manual-actions.ts (org-scoped reads)
// and manual-share-actions.ts (share-scoped reads) — deliberately not a
// "use server" export itself, since any export from an action file becomes
// a publicly callable endpoint and this does no authorization of its own.
export function buildSectionTree(rows: FlatSectionRow[]): ManualSection[] {
  const byParent = new Map<string | null, FlatSectionRow[]>();
  for (const row of rows) {
    const siblings = byParent.get(row.parentId) ?? [];
    siblings.push(row);
    byParent.set(row.parentId, siblings);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.rank.localeCompare(b.rank));
  }

  function build(parentId: string | null, prefix: string): ManualSection[] {
    const siblings = byParent.get(parentId) ?? [];
    return siblings.map((row, i) => {
      const number = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      const children = build(row.id, number);
      return {
        id: row.id,
        number,
        title: row.title,
        blocks: row.blocks as ContentBlock[],
        ...(children.length > 0 ? { children } : {}),
      };
    });
  }

  return build(null, "");
}
