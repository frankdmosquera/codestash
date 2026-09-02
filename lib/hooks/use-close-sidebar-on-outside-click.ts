"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

// Desktop-only — the mobile variant is a Sheet (Radix Dialog under the
// hood), which already closes on outside click/scrim tap for free.
// Excludes the sidebar itself and its trigger button so opening/closing
// via the trigger doesn't fight with this (pointerdown fires before the
// trigger's click handler, so without the exclusion this would close the
// sidebar first and the trigger's own toggle would immediately reopen it).
export function useCloseSidebarOnOutsideClick() {
  const { open, setOpen, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobile || !open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      const sidebar = document.querySelector('[data-slot="sidebar"]');
      const trigger = document.querySelector('[data-slot="sidebar-trigger"]');
      if (sidebar?.contains(target) || trigger?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMobile, open, setOpen]);
}
