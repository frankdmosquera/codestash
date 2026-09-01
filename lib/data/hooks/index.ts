import type { Snippet } from "../types";
import { useDebounce } from "./use-debounce";
import { useLocalStorage } from "./use-local-storage";
import { useMediaQuery } from "./use-media-query";
import { useClipboard } from "./use-clipboard";
import { useOnClickOutside } from "./use-on-click-outside";

// One file per hook goes in this folder (e.g. `use-debounce.ts`), each
// exporting its own `Snippet` record. This file just collects them.
export const hooks: Snippet[] = [
  useDebounce,
  useLocalStorage,
  useMediaQuery,
  useClipboard,
  useOnClickOutside,
];

export function getHook(slug: string): Snippet | undefined {
  return hooks.find((h) => h.slug === slug);
}
