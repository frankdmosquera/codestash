import type { Snippet } from "../types";

export const debounce: Snippet = {
  slug: "debounce",
  title: "debounce",
  description:
    "Wraps a function so it only fires after a pause in calls, delaying execution until activity settles.",
  code: `function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const onResize = debounce(() => console.log("resized"), 250);
window.addEventListener("resize", onResize);
`,
};
