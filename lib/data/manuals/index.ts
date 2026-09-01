import type { Manual } from "../types";
import { masteringGit } from "./mastering-git";
import { dockerForFrontendDevs } from "./docker-for-frontend-devs";
import { understandingRsc } from "./understanding-rsc";
import { cicdBasics } from "./cicd-basics";
import { debuggingNextjs } from "./debugging-nextjs";
import { next16NeonBetterAuth } from "./next16-neon-better-auth";

export const manuals: Manual[] = [
  masteringGit,
  dockerForFrontendDevs,
  understandingRsc,
  cicdBasics,
  debuggingNextjs,
  next16NeonBetterAuth,
];

export function getManual(slug: string): Manual | undefined {
  return manuals.find((m) => m.slug === slug);
}
