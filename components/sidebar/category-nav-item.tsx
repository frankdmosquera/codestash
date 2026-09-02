"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

type SortMode = "alpha" | "recent";

export type CategoryNavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  // Only set for the fixed set of categories that have static subpage data
  // today (see lib/data). Custom/DB-only categories have no subpages yet —
  // rendered as the existing empty state, not a crash.
  staticKey?: CatalogCategoryKey;
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
  dragHandle,
}: CategoryNavItemProps) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("alpha");

  // Only computed once the panel is actually opened — no reason to sort
  // every category's items on every sidebar render.
  const items = useMemo(() => {
    if (!open || !staticKey) return [];
    const list = getItemsByCategory(staticKey);
    return [...list].sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      // "recent" = newest createdAt first; items missing one sort last.
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [open, sort, staticKey]);

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
            <div className="max-h-64 overflow-y-auto">
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
