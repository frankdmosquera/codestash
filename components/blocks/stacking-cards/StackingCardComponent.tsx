"use client";

import Image from "next/image";
import { useRef } from "react";

import { stackingCardsData } from "./cardsData";
import StackingCards, { StackingCardItem } from "./stacking-cards";
import { cn } from "@/lib/utils";

export function StackingCardComponent() {
  const container = useRef<HTMLDivElement>(null);
  return (
    <div
      className="h-[620px] bg-white overflow-auto text-white"
      ref={container}
    >
      <StackingCards
        totalCards={stackingCardsData.length}
        scrollOptions={{ container: container }}
      >
        <div className="relative font-calendas h-[620px] w-full z-10 text-2xl md:text-7xl font-bold uppercase flex justify-center items-center text-[#ff5941] whitespace-pre">
          Scroll down ↓
        </div>
        {stackingCardsData.map(
          ({ bgColor, description, image, title }, index) => {
            return (
              <StackingCardItem key={index} index={index} className="h-[620px]">
                <div
                  className={cn(
                    bgColor,
                    "h-[80%] sm:h-[70%] flex-col sm:flex-row aspect-video px-8 py-10 flex w-11/12 rounded-3xl mx-auto relative",
                  )}
                >
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-2xl mb-5">{title}</h3>
                    <p>{description}</p>
                  </div>

                  <div className="w-full sm:w-1/2 rounded-xl aspect-video relative overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      className="object-cover"
                      fill
                    />
                  </div>
                </div>
              </StackingCardItem>
            );
          },
        )}

        <div className="w-full h-80 relative overflow-hidden">
          <h2 className="absolute bottom-0 left-0 translate-y-1/3 sm:text-[192px] text-[80px] text-[#ff5941] font-calendas">
            fancy
          </h2>
        </div>
      </StackingCards>
    </div>
  );
}
