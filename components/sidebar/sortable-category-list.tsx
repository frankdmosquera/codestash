"use client";

import { useEffect, useState } from "react";
import { Grip } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { SidebarMenu } from "@/components/ui/sidebar";
import { resolveIcon } from "@/lib/icon-map";
import { reorderCategoryAction, type DbCategoryRow } from "@/lib/actions/category-actions";
import { CategoryNavItem } from "./category-nav-item";

function SortableItem({ row }: { row: DbCategoryRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <CategoryNavItem
        icon={resolveIcon(row.icon)}
        label={row.label}
        href={`/${row.slug}`}
        dbCategoryId={row.id}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${row.label}`}
            className="touch-none rounded p-1.5 text-neutral-600 hover:bg-neutral-800 hover:text-neutral-300"
          >
            <Grip className="size-4" />
          </button>
        }
      />
    </div>
  );
}

export function SortableCategoryList({
  categories,
}: {
  categories: DbCategoryRow[];
}) {
  // Optimistic local order — synced whenever a fresh fetch comes in (e.g.
  // React Query refetching after invalidation elsewhere).
  const [items, setItems] = useState(categories);
  useEffect(() => setItems(categories), [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const moved = reordered[newIndex];
    const beforeRank = reordered[newIndex - 1]?.rank ?? null;
    const afterRank = reordered[newIndex + 1]?.rank ?? null;

    try {
      const { rank } = await reorderCategoryAction(moved.id, beforeRank, afterRank);
      setItems((current) =>
        current.map((item) => (item.id === moved.id ? { ...item, rank } : item)),
      );
    } catch {
      // Persist failed — fall back to the last known-good server order
      // rather than leaving the sidebar showing an order that didn't save.
      setItems(categories);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <SidebarMenu>
          {items.map((row) => (
            <SortableItem key={row.id} row={row} />
          ))}
        </SidebarMenu>
      </SortableContext>
    </DndContext>
  );
}
