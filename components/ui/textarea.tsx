import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Deliberately NOT field-sizing-content (auto-grow height to fit
        // content) — it sounds nice but has a real bug: for unbroken text
        // (a long URL, minified code, no spaces to break on), it also
        // grows the textarea's WIDTH to fit the content, completely
        // overriding w-full/max-w-full. Confirmed directly: forcing
        // field-sizing back to fixed dropped an overflowing textarea from
        // 1886px wide to the correct 342px. [field-sizing:fixed] is
        // explicit rather than just omitted, so the choice reads as
        // deliberate, not a missing utility.
        "flex [field-sizing:fixed] min-h-16 w-full max-w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base whitespace-pre-wrap wrap-break-word transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
