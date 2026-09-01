import type { Snippet } from "../types";
import { claudeMdStarter } from "./claude-md-starter";
import { cursorRulesNextjs } from "./cursor-rules-nextjs";
import { prDescriptionPrompt } from "./pr-description-prompt";
import { commitMessagePrompt } from "./commit-message-prompt";
import { codeReviewChecklistPrompt } from "./code-review-checklist-prompt";

// One file per instruction goes in this folder (e.g. `claude-md-starter.ts`),
// each exporting its own `Snippet` record. This file just collects them.
export const aiInstructions: Snippet[] = [
  claudeMdStarter,
  cursorRulesNextjs,
  prDescriptionPrompt,
  commitMessagePrompt,
  codeReviewChecklistPrompt,
];

export function getAiInstruction(slug: string): Snippet | undefined {
  return aiInstructions.find((a) => a.slug === slug);
}
