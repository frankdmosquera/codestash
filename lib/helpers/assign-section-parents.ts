// Converts a flat, depth-tagged list (what the create/edit form sends —
// see manual-form.tsx and manual-validation.ts) into parent-child links,
// by index into the same array. Same stack-based shape as
// scripts/lib/markdown-to-manual-sections.ts's heading-level walk — pop
// back to the last node whose depth is less than this one, whatever's left
// on top of the stack (or nothing) is the parent. Assumes document order:
// a child always appears after its parent in the input array, which is
// how the form and every reader of a section tree already work.
export function assignSectionParents<T extends { depth: number }>(
  sections: T[],
): { input: T; parentIndex: number | null }[] {
  const stack: { index: number; depth: number }[] = [];
  const result: { input: T; parentIndex: number | null }[] = [];

  sections.forEach((input, index) => {
    while (stack.length > 0 && stack[stack.length - 1].depth >= input.depth) {
      stack.pop();
    }
    const parentIndex = stack.length > 0 ? stack[stack.length - 1].index : null;
    result.push({ input, parentIndex });
    stack.push({ index, depth: input.depth });
  });

  return result;
}
