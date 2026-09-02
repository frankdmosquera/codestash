"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getItemsByCategory } from "@/lib/data";
import { CATEGORY_LIST } from "@/lib/constants/categories";

export function SidebarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <Command className="rounded-md border" shouldFilter>
      <CommandInput
        placeholder="Search..."
        value={query}
        onValueChange={setQuery}
      />
      {query.trim() && (
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {CATEGORY_LIST.map((category) => (
            <CommandGroup key={category.key} heading={category.label}>
              {getItemsByCategory(category.key).map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${category.label} ${item.title}`}
                  onSelect={() => {
                    setQuery("");
                    router.push(item.href);
                  }}
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      )}
    </Command>
  );
}
