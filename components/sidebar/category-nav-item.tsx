"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getManualsForCategory } from "@/lib/actions/manual-actions";
import { useCategoryOpen } from "./category-open-context";

type SortMode = "alpha" | "recent";
type SortDirection = "asc" | "desc";
type SubItem = { id: string; title: string; href: string; createdAt?: string };

export type CategoryNavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  // Subitems are fetched from the `manual` table scoped to this category.
  dbCategoryId: string;
  // Rendered as a sibling of the trigger button, not nested inside it —
  // interactive drag handles can't live inside another interactive
  // element. Passed in by a sortable wrapper; omitted entirely when this
  // category isn't in a reorderable (own-workspace) list.
  dragHandle?: ReactNode;
};

export function CategoryNavItem({
  icon: Icon,
  label,
  href,
  dbCategoryId,
  dragHandle,
}: CategoryNavItemProps) {
  const [open, setOpen] = useCategoryOpen(href);
  const [sort, setSort] = useState<SortMode>("alpha");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const { data: dbManuals, isLoading: dbLoading } = useQuery({
    queryKey: ["manuals", dbCategoryId],
    queryFn: () => getManualsForCategory(dbCategoryId),
    enabled: open,
  });

  // Only computed once the panel is actually opened — no reason to sort
  // every category's items on every sidebar render.
  const items = useMemo(() => {
    if (!open || dbLoading) return [];

    const raw: SubItem[] = (dbManuals ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      href: `${href}/${m.slug}`,
      createdAt: new Date(m.createdAt).toISOString(),
    }));

    return [...raw].sort((a, b) => {
      const cmp =
        sort === "alpha"
          ? a.title.localeCompare(b.title)
          : (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      return direction === "asc" ? cmp : -cmp;
    });
  }, [open, sort, direction, dbLoading, dbManuals, href]);

  // Clicking the already-active sort flips its direction; switching to the
  // other sort resets to that sort's natural default (A-Z, newest-first).
  function handleSortClick(mode: SortMode) {
    if (sort === mode) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(mode);
      setDirection(mode === "alpha" ? "asc" : "desc");
    }
  }

  // Drives the bottom fade below — without it, a truncated list looks
  // identical to a complete one since the native scrollbar is invisible
  // until the user hovers/drags it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () =>
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
    update();
    el.addEventListener("scroll", update);
    return () => el.removeEventListener("scroll", update);
  }, [items]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <div className="flex items-center gap-1">
          {dragHandle}
          <CollapsibleTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "min-w-0 flex-1 text-neutral-200 [&_svg]:size-5 [&_svg]:text-teal-400 hover:bg-neutral-800 hover:text-white",
                  open && "bg-neutral-800 text-white",
                )}
              />
            }
          >
            <Icon />
            <span className="text-base">{label}</span>
            <ChevronRight
              className={cn(
                "ml-auto size-4! text-neutral-500! transition-transform",
                open && "rotate-90",
              )}
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="mt-1.5 mr-3.5 mb-1.5 ml-14 rounded-md border-neutral-800 bg-neutral-900 py-1.5">
            <li className="flex items-center gap-1 px-1 pb-1 text-xs text-neutral-500">
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
            </li>
            <div className="relative">
              <div
                ref={scrollRef}
                className="max-h-36 scrollbar-thin overflow-y-auto overscroll-contain [scrollbar-color:var(--color-neutral-700)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent"
              >
                {items.map((item) => (
                  <SidebarMenuSubItem key={item.id}>
                    <SidebarMenuSubButton
                      render={<Link href={item.href} />}
                      className="text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    >
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
                {items.length === 0 && (
                  <p className="px-2 py-1 text-xs text-neutral-600">
                    Nothing here yet.
                  </p>
                )}
              </div>
              {canScrollDown && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-neutral-900 to-transparent" />
              )}
            </div>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                render={<Link href={href} />}
                className="text-teal-400 hover:bg-neutral-800 hover:text-teal-300"
              >
                View category page
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
