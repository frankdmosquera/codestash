// categories.ts
// → lib/constants/categories.ts

import type { ComponentType } from "react";
import {
  BookOpen,
  Anchor,
  Wrench,
  Blocks as BlocksIcon,
  FileCode2,
  type LucideIcon,
} from "lucide-react";

import { ManualsBackground } from "@/components/manuals-background";
import { HooksBackground } from "@/components/hooks-background";
import { HelpersBackground } from "@/components/helpers-background";
import { BlocksBackground } from "@/components/blocks-background";
// import { SnippetsBackground } from "@/components/snippets-background";
import type { CatalogCategoryKey } from "@/lib/data/types";
import { AiInstructionsBackground } from "@/components/ai-instructions-background";

export type CategoryConfig = {
  key: CatalogCategoryKey;
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  Background: ComponentType;
};

export const CATEGORIES: Record<CatalogCategoryKey, CategoryConfig> = {
  manuals: {
    key: "manuals",
    label: "Manuals",
    href: "/manuals",
    description:
      "Long-form written references. Start here, then jump to Blocks or Snippets once you know what you're building.",
    icon: BookOpen,
    Background: ManualsBackground,
  },
  hooks: {
    key: "hooks",
    label: "Hooks",
    href: "/hooks",
    description: "Reusable React hooks, ready to drop in.",
    icon: Anchor,
    Background: HooksBackground,
  },
  helpers: {
    key: "helpers",
    label: "Helpers",
    href: "/helpers",
    description: "Utility functions for everyday problems.",
    icon: Wrench,
    Background: HelpersBackground,
  },
  blocks: {
    key: "blocks",
    label: "Blocks",
    href: "/blocks",
    description: "Prebuilt UI sections you can assemble fast.",
    icon: BlocksIcon,
    Background: BlocksBackground,
  },
  aiInstructions: {
    key: "aiInstructions",
    label: "AI Instructions",
    href: "/ai-instructions",
    description: "Prompts and instructions for working with AI tools.",
    icon: FileCode2,
    Background: AiInstructionsBackground,
  },
};

export const CATEGORY_LIST: CategoryConfig[] = Object.values(CATEGORIES);

// The `[category]` route segment is the url slug (e.g. "ai-instructions"),
// not the CATEGORIES record key (e.g. "aiInstructions") — this resolves one
// from the other.
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_LIST.find((category) => category.href === `/${slug}`);
}
