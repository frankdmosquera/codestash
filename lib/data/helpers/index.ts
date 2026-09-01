import type { Snippet } from "../types";
import { formatCurrency } from "./format-currency";
import { slugify } from "./slugify";
import { debounce } from "./debounce";
import { truncateText } from "./truncate-text";
import { groupBy } from "./group-by";

// One file per helper goes in this folder (e.g. `format-currency.ts`), each
// exporting its own `Snippet` record. This file just collects them.
export const helpers: Snippet[] = [
  formatCurrency,
  slugify,
  debounce,
  truncateText,
  groupBy,
];

export function getHelper(slug: string): Snippet | undefined {
  return helpers.find((h) => h.slug === slug);
}
