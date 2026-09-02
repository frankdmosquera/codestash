// category-card.tsx
// → components/category-card.tsx

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTopItems } from "@/lib/helpers/get-top-items";
import { CATEGORIES, getCategoryBySlug } from "@/lib/constants/categories";
import type { CatalogCategoryKey } from "@/lib/data/types";
import { getResolvedItemsForCategory } from "@/lib/actions/manual-actions";

type CategoryCardProps = {
  categoryKey: CatalogCategoryKey;
};

export async function CategoryCard({ categoryKey }: CategoryCardProps) {
  const { label, href, icon: Icon } = CATEGORIES[categoryKey];
  const categorySlug = href.slice(1); // href is "/manuals" etc.
  const allItems = await getResolvedItemsForCategory(
    categorySlug,
    getCategoryBySlug(categorySlug)?.key,
    href,
  );
  const items = getTopItems(allItems, 4);

  return (
    <Card className="flex h-full flex-col justify-between bg-neutral-900 p-6">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-teal-400" strokeWidth={1.75} />
          <h3 className="text-2xl font-semibold text-white">{label}</h3>
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
