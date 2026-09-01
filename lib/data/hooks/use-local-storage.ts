import type { Snippet } from "../types";

export const useLocalStorage: Snippet = {
  slug: "use-local-storage",
  title: "useLocalStorage",
  description:
    "Persists state to localStorage and syncs it back on load, with SSR-safe fallbacks.",
  createdAt: "2026-08-24",
  code: `import { useState, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(
          \`Tried setting localStorage key "\${key}" even though environment is not a client\`
        );
      }

      try {
        const newValue =
          value instanceof Function ? value(storedValue) : value;

        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.warn(\`Error setting localStorage key "\${key}":\`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
`,
};
