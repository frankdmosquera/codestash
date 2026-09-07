"use client";

import { useState, type ReactNode } from "react";
import { Grip } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { authClient } from "@/lib/auth-client";
import { getCategoriesForActiveOrg } from "@/lib/actions/category-actions";
import { useCategoryReorder } from "@/lib/hooks/use-category-reorder";
import { sortByMode, type SortMode, type SortDirection } from "@/lib/helpers/sort-order";
import { cn } from "@/lib/utils";
import { CategoryCard } from "./category-card";

function SortableCard({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative"
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Reorder category"
        className="absolute top-3 right-3 z-10 touch-none rounded p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
      >
        <Grip className="size-4" />
      </button>
      {children}
    </div>
  );
}

// Fetches via the exact same query key AppSidebar uses (["categories",
// organization?.id]) — see use-category-reorder.ts — so this grid and the
// sidebar share one live cache entry. Dragging a card here moves it in the
// sidebar instantly too, not just "the same DB rows after a refresh."
export function SortableCategoryGrid() {
  const { data: organization } = authClient.useActiveOrganization();
  const { data: categories } = useQuery({
    queryKey: ["categories", organization?.id],
    queryFn: getCategoriesForActiveOrg,
    enabled: !!organization,
  });

  const { sensors, handleDragEnd } = useCategoryReorder(organization?.id, categories ?? []);
  const [sort, setSort] = useState<SortMode>("custom");
  const [direction, setDirection] = useState<SortDirection>("asc");

  if (!categories) return null;

  function handleSortClick(mode: "alpha" | "recent") {
    if (sort === mode) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(mode);
      setDirection(mode === "alpha" ? "asc" : "desc");
    }
  }

  const sortRow = (
    <div className="mt-10 flex items-center gap-1 text-xs text-neutral-500">
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
  );

  if (sort !== "custom") {
    const sorted = sortByMode(
      categories,
      sort,
      direction,
      (c) => c.label,
      (c) => c.createdAt.toISOString(),
    );
    return (
      <>
        {sortRow}
        <div className="mt-4 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {sortRow}
      <DndContext
        id="sortable-category-grid"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={categories.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="mt-4 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <SortableCard key={category.id} id={category.id}>
                <CategoryCard category={category} />
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
