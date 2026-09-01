import type { Snippet } from "../types";

export const truncateText: Snippet = {
  slug: "truncate-text",
  title: "truncateText",
  description:
    "Truncates text to a max length, breaking on a word boundary instead of mid-word when possible.",
  code: `function truncateText(text: string, maxLength: number, ellipsis = "…"): string {
  if (text.length <= maxLength) return text;

  const sliceLength = Math.max(maxLength - ellipsis.length, 0);
  const sliced = text.slice(0, sliceLength);

  const lastSpace = sliced.lastIndexOf(" ");
  const truncated = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;

  return truncated + ellipsis;
}

truncateText("The quick brown fox jumps over the lazy dog", 20);
// "The quick brown…"
truncateText("Supercalifragilistic", 10);
// "Supercali…"
`,
};
