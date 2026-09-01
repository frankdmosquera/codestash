import type { Snippet } from "../types";

export const useDebounce: Snippet = {
  slug: "use-debounce",
  title: "useDebounce",
  description:
    "Delays updating a value until it stops changing for a given interval — handy for search inputs.",
  createdAt: "2026-08-21",
  code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
`,
};
