"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CategoryOpenContextValue = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const CategoryOpenContext = createContext<CategoryOpenContextValue | null>(null);

// Shared across every CategoryNavItem in the sidebar (both the static list
// and the DB-backed sortable one) so opening one category closes whichever
// other was open, and clicking anywhere outside the sidebar closes it too.
export function CategoryOpenProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) return;

    function handlePointerDown(e: PointerEvent) {
      const sidebar = document.querySelector('[data-slot="sidebar"]');
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setOpenId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openId]);

  return (
    <CategoryOpenContext.Provider value={{ openId, setOpenId }}>
      {children}
    </CategoryOpenContext.Provider>
  );
}

// `id` should be unique per category — href works well since every
// category (static or DB-backed) already has one.
export function useCategoryOpen(id: string) {
  const ctx = useContext(CategoryOpenContext);
  if (!ctx) {
    throw new Error("useCategoryOpen must be used within a CategoryOpenProvider");
  }
  const isOpen = ctx.openId === id;
  const setOpen = (next: boolean) => ctx.setOpenId(next ? id : null);
  return [isOpen, setOpen] as const;
}
