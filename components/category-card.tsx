// category-card.tsx
// → components/category-card.tsx

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTopItems } from "@/lib/helpers/get-top-items";
import { resolveIcon } from "@/lib/icon-map";
import { getResolvedItemsForCategory } from "@/lib/actions/manual-actions";
import type { DbCategoryRow } from "@/lib/actions/category-actions";

// Takes the already-resolved icon component as a prop rather than resolving
// it inline where it's rendered — same pattern as CategoryIcon in
// [category]/page.tsx (resolveIcon()'s result used as a JSX tag in the same
// scope it's assigned in trips the "components created during render" rule).
function CategoryCardIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="size-5 text-teal-400" strokeWidth={1.75} />;
}

type CategoryCardProps = {
  category: DbCategoryRow;
};

// Client component (not the async Server Component this used to be) so it
// can live inside the home page's drag-and-drop grid — dnd-kit's
// useSortable needs a client boundary around each draggable card either
// way, so fetching its own item preview client-side (same pattern
// CategoryNavItem already uses in the sidebar) costs nothing extra.
export function CategoryCard({ category }: CategoryCardProps) {
  const href = `/${category.slug}`;
  const { data: allItems } = useQuery({
    queryKey: ["resolved-items", category.slug],
    queryFn: () => getResolvedItemsForCategory(category.slug, href),
  });
  const items = getTopItems(allItems ?? [], 4);

  return (
    <Card className="flex h-full flex-col justify-between bg-neutral-900 p-6">
      <div>
        <div className="flex items-center gap-2">
          <CategoryCardIcon icon={resolveIcon(category.icon)} />
          <h3 className="text-2xl font-semibold text-white">{category.label}</h3>
        </div>

        <ul className="mt-3 space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block truncate rounded-md px-2 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "secondary", size: "sm" }),
          "w-fit gap-1.5",
        )}
      >
        See all
        <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}
