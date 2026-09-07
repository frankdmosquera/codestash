"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Grip } from "lucide-react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reorderManualAction, type ResolvedCatalogItem } from "@/lib/actions/manual-actions";
import { sortByMode, type SortMode, type SortDirection } from "@/lib/helpers/sort-order";

function ItemCardBody({ item }: { item: ResolvedCatalogItem }) {
  return (
    <Card className="h-full justify-between gap-3 bg-neutral-900 p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">{item.title}</h2>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
            {item.description}
          </p>
        )}
      </div>
      <Link
        href={item.href}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "w-fit gap-1.5",
        )}
      >
        View
        <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}

function SortableItemCard({ item }: { item: ResolvedCatalogItem }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <li
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
        aria-label={`Reorder ${item.title}`}
        className="absolute top-2 right-2 z-10 touch-none rounded p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
      >
        <Grip className="size-4" />
      </button>
      <ItemCardBody item={item} />
    </li>
  );
}

// Only ever rendered in one place at a time (a single category page), so
// unlike the home page's category grid there's no second view to keep in
// lockstep with — plain local state seeded from the server-rendered
// `items` prop is enough. The actual order still persists to the DB via
// reorderManualAction, shared across every device/session for this org;
// "local state" here just means where the optimistic drag copy lives
// during the interaction, not where the real order lives.
export function SortableItemGrid({ items: initialItems }: { items: ResolvedCatalogItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [sort, setSort] = useState<SortMode>("custom");
  const [direction, setDirection] = useState<SortDirection>("asc");
  // Adjusting state when a prop changes, done during render rather than in
  // an effect (react.dev's own recommended pattern for this) — avoids the
  // extra render-then-effect-then-render cascade a useEffect sync causes.
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

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
      const { rank } = await reorderManualAction(moved.id, beforeRank, afterRank);
      setItems((current) => current.map((item) => (item.id === moved.id ? { ...item, rank } : item)));
    } catch {
      // Persist failed — fall back to the last known-good server order
      // rather than leaving the grid showing an order that didn't save.
      setItems(initialItems);
    }
  }

  function handleSortClick(mode: "alpha" | "recent") {
    if (sort === mode) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(mode);
      setDirection(mode === "alpha" ? "asc" : "desc");
    }
  }

  const sortRow = (
    <div className="mt-6 flex items-center gap-1 text-xs text-neutral-500">
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

  if (items.length === 0) {
    return (
      <p className="mt-12 text-neutral-400">
        Nothing here yet — check back soon.
      </p>
    );
  }

  if (sort !== "custom") {
    const sorted = sortByMode(
      items,
      sort,
      direction,
      (item) => item.title,
      (item) => item.createdAt ?? "",
    );
    return (
      <>
        {sortRow}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => (
            <li key={item.id}>
              <ItemCardBody item={item} />
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      {sortRow}
      <DndContext
        id="sortable-item-grid"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <SortableItemCard key={item.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
