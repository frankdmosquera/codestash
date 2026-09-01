import { CATEGORIES } from "@/lib/constants/categories";
import type { CatalogCategoryKey, CatalogItem, Snippet } from "./types";
import { manuals } from "./manuals";
import { hooks, getHook } from "./hooks";
import { helpers, getHelper } from "./helpers";
import { blocks, getBlock } from "./blocks";
import { aiInstructions, getAiInstruction } from "./ai-instructions";

function toCatalogItems<T extends { slug: string; title: string; description?: string; createdAt?: string }>(
  category: CatalogCategoryKey,
  items: T[],
): CatalogItem[] {
  const categoryHref = CATEGORIES[category].href;
  return items.map((item) => ({
    id: `${category}-${item.slug}`,
    category,
    title: item.title,
    href: `${categoryHref}/${item.slug}`,
    description: item.description,
    createdAt: item.createdAt,
  }));
}

export const CATALOG_ITEMS: CatalogItem[] = [
  ...toCatalogItems("manuals", manuals),
  ...toCatalogItems("hooks", hooks),
  ...toCatalogItems("helpers", helpers),
  ...toCatalogItems("blocks", blocks),
  ...toCatalogItems("aiInstructions", aiInstructions),
];

export function getItemsByCategory(category: CatalogCategoryKey): CatalogItem[] {
  return CATALOG_ITEMS.filter((item) => item.category === category);
}

// Every non-manual category shares the same `Snippet` shape, so subpage
// rendering can look one up generically instead of branching per category.
export function getSnippet(
  category: Exclude<CatalogCategoryKey, "manuals">,
  slug: string,
): Snippet | undefined {
  switch (category) {
    case "hooks":
      return getHook(slug);
    case "helpers":
      return getHelper(slug);
    case "blocks":
      return getBlock(slug);
    case "aiInstructions":
      return getAiInstruction(slug);
  }
}

export { manuals, getManual } from "./manuals";
export { hooks, getHook } from "./hooks";
export { helpers, getHelper } from "./helpers";
export { blocks, getBlock } from "./blocks";
export { aiInstructions, getAiInstruction } from "./ai-instructions";
export * from "./types";
