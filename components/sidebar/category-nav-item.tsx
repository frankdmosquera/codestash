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
import { getItemsByCategory, type CatalogCategoryKey } from "@/lib/data";
import { getManualsForCategory } from "@/lib/actions/manual-actions";

type SortMode = "alpha" | "recent";
type SubItem = { id: string; title: string; href: string; createdAt?: string };

export type CategoryNavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  // Only set for the fixed set of categories that have static subpage data
  // today (see lib/data). Falls back to the empty state when neither this
  // nor `dbCategoryId` resolves any items.
  staticKey?: CatalogCategoryKey;
  // Set for a DB-backed category row — when present, subitems are fetched
  // from the `manual` table scoped to this category, falling back to the
  // static catalog (if `staticKey` matches) only once that query resolves
  // with zero rows.
  dbCategoryId?: string;
  // Rendered as a sibling of the trigger button, not nested inside it —
  // interactive drag handles can't live inside another interactive
  // element. Passed in by a sortable wrapper; omitted entirely when this
  // category isn't in a reorderable (DB-backed) list.
  dragHandle?: ReactNode;
};

export function CategoryNavItem({
  icon: Icon,
  label,
  href,
  staticKey,
  dbCategoryId,
  dragHandle,
}: CategoryNavItemProps) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("alpha");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const { data: dbManuals, isLoading: dbLoading } = useQuery({
    queryKey: ["manuals", dbCategoryId],
    queryFn: () => getManualsForCategory(dbCategoryId!),
    enabled: open && !!dbCategoryId,
  });

  const staticItems: SubItem[] = useMemo(() => {
    if (!staticKey) return [];
    return getItemsByCategory(staticKey).map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
      createdAt: item.createdAt,
    }));
  }, [staticKey]);

  // Only computed once the panel is actually opened — no reason to sort
  // every category's items on every sidebar render.
  const items = useMemo(() => {
    if (!open) return [];

    let raw: SubItem[];
    if (dbCategoryId) {
      // Wait for the DB query rather than flashing static content first —
      // avoids a fallback-then-swap flicker on open.
      if (dbLoading) return [];
      raw =
        dbManuals && dbManuals.length > 0
          ? dbManuals.map((m) => ({
              id: m.id,
              title: m.title,
              href: `${href}/${m.slug}`,
              createdAt: new Date(m.createdAt).toISOString(),
            }))
          : staticItems;
    } else {
      raw = staticItems;
    }

    return [...raw].sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      // "recent" = newest createdAt first; items missing one sort last.
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [open, sort, dbCategoryId, dbLoading, dbManuals, staticItems, href]);

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
                className="min-w-0 flex-1 text-neutral-200 [&_svg]:size-5 [&_svg]:text-teal-400 hover:bg-neutral-800 hover:text-white"
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
          <SidebarMenuSub className="border-neutral-800">
            <li className="flex items-center gap-1 px-1 pb-1 text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => setSort("alpha")}
                className={cn(
                  "rounded px-1.5 py-0.5 hover:text-neutral-200",
                  sort === "alpha" && "bg-neutral-800 text-neutral-200",
                )}
              >
                A–Z
              </button>
              <button
                type="button"
                onClick={() => setSort("recent")}
                className={cn(
                  "rounded px-1.5 py-0.5 hover:text-neutral-200",
                  sort === "recent" && "bg-neutral-800 text-neutral-200",
                )}
              >
                Newest
              </button>
            </li>
            <div className="relative">
              <div
                ref={scrollRef}
                className="max-h-64 scrollbar-thin overflow-y-auto overscroll-contain [scrollbar-color:var(--color-neutral-700)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent"
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-neutral-950 to-transparent" />
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
