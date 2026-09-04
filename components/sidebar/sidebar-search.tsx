"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getSearchableCatalogItems } from "@/lib/actions/manual-actions";

export function SidebarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data: items } = useQuery({
    queryKey: ["searchable-catalog-items"],
    queryFn: getSearchableCatalogItems,
  });

  const groups = useMemo(() => {
    const byCategory = new Map<string, typeof items>();
    for (const item of items ?? []) {
      const existing = byCategory.get(item.categoryLabel) ?? [];
      existing.push(item);
      byCategory.set(item.categoryLabel, existing);
    }
    return byCategory;
  }, [items]);

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
          {[...groups.entries()].map(([categoryLabel, categoryItems]) => (
            <CommandGroup key={categoryLabel} heading={categoryLabel}>
              {categoryItems?.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${categoryLabel} ${item.title}`}
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
