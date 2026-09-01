import type { Snippet } from "../types";

export const formatCurrency: Snippet = {
  slug: "format-currency",
  title: "formatCurrency",
  description:
    "Formats a number as a localized currency string using Intl.NumberFormat.",
  createdAt: "2026-08-24",
  code: `function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

formatCurrency(1234.5); // "$1,234.50"
formatCurrency(1234.5, "EUR", "de-DE"); // "1.234,50 €"
`,
};
