import type { Snippet } from "../types";

export const slugify: Snippet = {
  slug: "slugify",
  title: "slugify",
  description:
    "Converts a string into a URL-safe slug, stripping accents and collapsing separators.",
  createdAt: "2026-08-27",
  code: `function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // split accented characters into base + diacritic
    .replace(/[\\u0300-\\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // collapse non-alphanumeric runs into a hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

slugify("  Héllo, World!  "); // "hello-world"
slugify("Café & Bar — 2024"); // "cafe-bar-2024"
`,
};
