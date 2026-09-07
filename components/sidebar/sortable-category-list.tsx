"use client";

import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grip } from "lucide-react";

import { SidebarMenu } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { resolveIcon } from "@/lib/icon-map";
import type { DbCategoryRow } from "@/lib/actions/category-actions";
import { useCategoryReorder } from "@/lib/hooks/use-category-reorder";
import { sortByMode, type SortMode, type SortDirection } from "@/lib/helpers/sort-order";
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
  const [sort, setSort] = useState<SortMode>("custom");
  const [direction, setDirection] = useState<SortDirection>("asc");

  // Same interaction as CategoryNavItem's sidebar preview: clicking the
  // already-active sort flips its direction; switching to a different sort
  // resets to that sort's natural default. Only "custom" (drag order) is
  // reorderable - picking alpha/recent trades the drag handles for a plain,
  // sorted list until "Custom" is clicked again.
  function handleSortClick(mode: "alpha" | "recent") {
    if (sort === mode) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(mode);
      setDirection(mode === "alpha" ? "asc" : "desc");
    }
  }

  const sorted = sortByMode(
    categories,
    sort,
    direction,
    (c) => c.label,
    (c) => c.createdAt.toISOString(),
  );

  return (
    <>
      <div className="flex items-center gap-1 px-2 pb-1.5 text-xs text-neutral-500">
        <button
          type="button"
          onClick={() => setSort("custom")}
          className={cn(
            "rounded px-1.5 py-0.5 hover:text-neutral-200",
            sort === "custom" && "bg-neutral-800 text-neutral-200",
          )}
        >
          Custom
        </button>
        <button
          type="button"
          onClick={() => handleSortClick("alpha")}
          className={cn(
            "rounded px-1.5 py-0.5 hover:text-neutral-200",
            sort === "alpha" && "bg-neutral-800 text-neutral-200",
          )}
        >
          {sort === "alpha" && direction === "desc" ? "Z–A" : "A–Z"}
        </button>
        <button
          type="button"
          onClick={() => handleSortClick("recent")}
          className={cn(
            "rounded px-1.5 py-0.5 hover:text-neutral-200",
            sort === "recent" && "bg-neutral-800 text-neutral-200",
          )}
        >
          {sort === "recent" && direction === "asc" ? "Oldest" : "Newest"}
        </button>
      </div>

      {sort === "custom" ? (
        <DndContext
          id="sortable-category-list"
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
      ) : (
        <SidebarMenu>
          {sorted.map((row) => (
            <CategoryNavItem
              key={row.id}
              icon={resolveIcon(row.icon)}
              label={row.label}
              href={`/${row.slug}`}
              dbCategoryId={row.id}
            />
          ))}
        </SidebarMenu>
      )}
    </>
  );
}
