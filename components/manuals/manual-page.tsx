"use client";
import type { Manual, ManualSection } from "@/lib/data/types";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ManualAccordion } from "./manual-accordion";
import { cn } from "@/lib/utils";

function collectIds(sections: ManualSection[]): string[] {
  return sections.flatMap((s) => [
    s.id,
    ...(s.children ? collectIds(s.children) : []),
  ]);
}

export function ManualPage({ manual }: { manual: Manual }) {
  const [query, setQuery] = useState("");
  const allIds = useMemo(() => collectIds(manual.sections), [manual.sections]);
  const [openIds, setOpenIds] = useState<Set<string>>(
    // () => new Set(manual.sections.map((s) => s.id)),// starts open
    () => new Set(), // starts close
  );
  const isAllExpanded = openIds.size === allIds.length;

  return (
    <div className=" text-black">
      <div className="bg-secondary-foreground p-3">
        <div className="">
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-4">
            {manual.title}
          </h1>
        </div>
        <div className="mb-4  flex flex-col gap-3 sm:flex-row sm:items-center ">
          <div className="relative flex-1 ">
            <Search className="  pointer-events-none absolute top-1/2 left-3  -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter sections and commands…"
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setOpenIds(isAllExpanded ? new Set() : new Set(allIds))
              }
              className={cn(
                "text-base cursor-pointer",
                isAllExpanded && "bg-teal-300",
              )}
              type="button"
            >
              {isAllExpanded ? "Collapse all" : "Expand all"}
            </Button>
          </div>
        </div>
      </div>

      <ManualAccordion
        sections={manual.sections}
        openIds={openIds}
        onOpenChange={setOpenIds}
        query={query.trim()}
      />
    </div>
  );
}
