import type { Snippet } from "../types";

export const useOnClickOutside: Snippet = {
  slug: "use-on-click-outside",
  title: "useOnClickOutside",
  description:
    "Calls a handler when a click or touch happens outside the given element — great for closing dropdowns and modals.",
  code: `import { useEffect, type RefObject } from "react";

export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;

      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
`,
};
