// nav-overlay-menu.tsx
// → components/nav-overlay-menu.tsx

"use client";

import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORY_LIST } from "@/lib/constants/categories";
// import { NAV_ITEMS } from "@/lib/constants";

interface NavOverlayMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavOverlayMenu({ open, onOpenChange }: NavOverlayMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none p-0 top-0 left-0 duration-300 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4"
      >
        <DialogTitle className="sr-only">Site menu</DialogTitle>
        <DialogDescription className="sr-only">
          Navigate to Manuals, Hooks, Helpers, Blocks, or Snippets.
        </DialogDescription>

        <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center px-6">
          <nav className="flex flex-col gap-1">
            {CATEGORY_LIST.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="group flex items-baseline justify-between border-b border-border py-5 first:pt-0"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <span className="flex flex-col gap-1">
                  <span className="font-mono text-3xl tracking-tight text-foreground transition-colors group-hover:text-muted-foreground sm:text-4xl">
                    {item.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          <div className="mt-10 flex items-center justify-between text-sm text-muted-foreground">
            <span>codestash</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GitBranch className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
