import type { Snippet } from "../types";
import { pricingTable } from "./pricing-table";
import { heroWithVideo } from "./hero-with-video";
import { faqAccordion } from "./faq-accordion";
import { testimonialCarousel } from "./testimonial-carousel";
import { ctaBanner } from "./cta-banner";

// One file per block goes in this folder (e.g. `pricing-table.ts`), each
// exporting its own `Snippet` record. This file just collects them.
export const blocks: Snippet[] = [
  pricingTable,
  heroWithVideo,
  faqAccordion,
  testimonialCarousel,
  ctaBanner,
];

export function getBlock(slug: string): Snippet | undefined {
  return blocks.find((b) => b.slug === slug);
}
