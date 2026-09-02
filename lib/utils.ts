import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD") // split accented characters into base + diacritic
    .replace(/\p{Mn}/gu, "") // strip diacritics (Unicode "nonspacing mark" category)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // collapse non-alphanumeric runs into a hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
