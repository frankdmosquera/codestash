// nav-dropdown-content.tsx
// → components/nav-dropdown-content.tsx

import { ArrowRight } from "lucide-react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { getItemsByCategory } from "@/lib/data";
import type { CatalogCategoryKey } from "@/lib/data/types";
import { getTopItems } from "@/lib/helpers/get-top-items";

interface NavDropdownContentProps {
  categoryKey: CatalogCategoryKey;
  categoryHref: string;
  categoryLabel: string;
}

export function NavDropdownContent({
  categoryKey,
  categoryHref,
  categoryLabel,
}: NavDropdownContentProps) {
  const items = getTopItems(getItemsByCategory(categoryKey), 8);

  return (
    <div className="w-[320px] p-2">
      <ul className="grid gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <NavigationMenuLink href={item.href}>
              <div className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                {item.title}
              </div>
            </NavigationMenuLink>
          </li>
        ))}
      </ul>

      <NavigationMenuLink
        href={categoryHref}
        className="mt-2 flex items-center justify-between rounded-md border-t border-border px-3 pt-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View all {categoryLabel.toLowerCase()}
        <ArrowRight className="size-3.5" />
      </NavigationMenuLink>
    </div>
  );
}
