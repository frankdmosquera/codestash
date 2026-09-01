"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

export function CodeBlock({ code }: { code: string }) {
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
      <pre className="overflow-x-auto p-3 pr-14 font-mono text-[0.85rem] leading-relaxed text-code-foreground">
        <code>{code}</code>
      </pre>
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
