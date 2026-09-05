"use client";

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { reorderCategoryAction, type DbCategoryRow } from "@/lib/actions/category-actions";

// Shared by the sidebar's SortableCategoryList and the home page's
// SortableCategoryGrid — both read categories from the same TanStack
// Query cache entry (["categories", organizationId]) and, critically,
// both write their reorder back into that same cache via
// queryClient.setQueryData rather than local component state. That's
// what makes dragging in either place update the other live: they're
// the same client-side state, not just the same DB rows eventually.
export function useCategoryReorder(organizationId: string | undefined, categories: DbCategoryRow[]) {
  const queryClient = useQueryClient();
  const queryKey = ["categories", organizationId];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((item) => item.id === active.id);
    const newIndex = categories.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    queryClient.setQueryData<DbCategoryRow[]>(queryKey, reordered);

    const moved = reordered[newIndex];
    const beforeRank = reordered[newIndex - 1]?.rank ?? null;
    const afterRank = reordered[newIndex + 1]?.rank ?? null;

    try {
      const { rank } = await reorderCategoryAction(moved.id, beforeRank, afterRank);
      queryClient.setQueryData<DbCategoryRow[]>(
        queryKey,
        (current) => current?.map((item) => (item.id === moved.id ? { ...item, rank } : item)) ?? current,
      );
    } catch {
      // Persist failed — fall back to the last known-good server order
      // rather than leaving either view showing an order that didn't save.
      queryClient.setQueryData<DbCategoryRow[]>(queryKey, categories);
    }
  }

  return { sensors, handleDragEnd };
}
