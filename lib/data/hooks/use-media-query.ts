import type { Snippet } from "../types";

export const useMediaQuery: Snippet = {
  slug: "use-media-query",
  title: "useMediaQuery",
  description:
    "Tracks whether a CSS media query currently matches, updating live as the viewport changes.",
  code: `import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const getMatches = (mediaQuery: string): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    const handleChange = () => {
      setMatches(mediaQueryList.matches);
    };

    handleChange();

    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
`,
};
