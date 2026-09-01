import type { ReactNode } from "react";

/**
 * Parses a very small subset of markdown inline syntax: **bold** and
 * `code`. Used across catalog content (manuals, snippets, etc.) so prose
 * can reference commands/flags inline without pulling in a markdown lib.
 */
export function parseInline(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-sm border bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}
