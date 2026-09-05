"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grip } from "lucide-react";

import { SidebarMenu } from "@/components/ui/sidebar";
import { resolveIcon } from "@/lib/icon-map";
import type { DbCategoryRow } from "@/lib/actions/category-actions";
import { useCategoryReorder } from "@/lib/hooks/use-category-reorder";
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
  organizationId,
}: {
  categories: DbCategoryRow[];
  organizationId: string | undefined;
}) {
  const { sensors, handleDragEnd } = useCategoryReorder(organizationId, categories);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <SidebarMenu>
          {categories.map((row) => (
            <SortableItem key={row.id} row={row} />
          ))}
        </SidebarMenu>
      </SortableContext>
    </DndContext>
  );
}
