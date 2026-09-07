// Shared by SortableCategoryList and SortableItemGrid — same three-way
// choice as CategoryNavItem's sidebar preview (alpha/recent, each with a
// direction that flips on a repeat click), plus "custom" as the default so
// drag-and-drop order is what you see until you deliberately pick a sort.
export type SortMode = "custom" | "alpha" | "recent";
export type SortDirection = "asc" | "desc";

export function sortByMode<T>(
  items: T[],
  mode: SortMode,
  direction: SortDirection,
  getLabel: (item: T) => string,
  getCreatedAt: (item: T) => string,
): T[] {
  if (mode === "custom") return items;
  return [...items].sort((a, b) => {
    const cmp =
      mode === "alpha"
        ? getLabel(a).localeCompare(getLabel(b))
        : getCreatedAt(a).localeCompare(getCreatedAt(b));
    return direction === "asc" ? cmp : -cmp;
  });
}
