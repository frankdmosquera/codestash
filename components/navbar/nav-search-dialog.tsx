// nav-search-dialog.tsx
// → components/nav-search-dialog.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getItemsByCategory } from "@/lib/data";
import { CATEGORY_LIST } from "@/lib/constants/categories";

interface NavSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavSearchDialog({ open, onOpenChange }: NavSearchDialogProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  function handleSelect(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search manuals, hooks, helpers, blocks, snippets..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {CATEGORY_LIST.map((category) => (
          <CommandGroup key={category.key} heading={category.label}>
            {getItemsByCategory(category.key).map((item) => (
              <CommandItem
                key={item.id}
                value={`${category.label} ${item.title}`}
                onSelect={() => handleSelect(item.href)}
              >
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
