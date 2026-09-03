"use client";

import { useRef, type ReactNode } from "react";

import StackingCards from "./stacking-cards";

// Owns only the scroll-container ref that drives the stacking animation —
// the actual card content is server-rendered and passed in as children.
export function StackingScrollContainer({
  children,
  totalCards,
}: {
  children: ReactNode;
  totalCards: number;
}) {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div className="h-[620px] bg-white overflow-auto text-white" ref={container}>
      <StackingCards totalCards={totalCards} scrollOptions={{ container }}>
        {children}
      </StackingCards>
    </div>
  );
}
