import type { Snippet } from "../types";

export const useClipboard: Snippet = {
  slug: "use-clipboard",
  title: "useClipboard",
  description:
    "Copies text to the clipboard and exposes a `copied` flag that auto-resets after 1.5s.",
  createdAt: "2026-08-27",
  code: `import { useState, useCallback, useRef, useEffect } from "react";

interface UseClipboardResult {
  copy: (text: string) => Promise<void>;
  copied: boolean;
}

export function useClipboard(resetDelay = 1500): UseClipboardResult {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, resetDelay);
      } catch (error) {
        console.warn("Failed to copy text to clipboard:", error);
        setCopied(false);
      }
    },
    [resetDelay]
  );

  return { copy, copied };
}
`,
};
