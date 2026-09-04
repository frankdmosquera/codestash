"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

// Owns only the copy interaction — the static <pre><code> markup is
// rendered server-side by CodeBlock and passed in as children, so this
// wrapper's client JS is just the click handler + copied-state toggle.
export function CodeBlockCopy({ code, children }: { code: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fail quietly.
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy();
        }
      }}
      aria-label="Copy code"
      className={cn(
        "group relative my-2 cursor-pointer overflow-hidden rounded-md border bg-code transition-colors",
        "hover:border-primary/50",
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] uppercase transition-colors",
          copied
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-code-border bg-background text-muted-foreground group-hover:text-foreground",
        )}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Copy"}
      </span>
    </div>
  );
}
