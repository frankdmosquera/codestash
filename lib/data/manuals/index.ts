import type { Manual } from "../types";
import { masteringGit } from "./mastering-git";
import { dockerForFrontendDevs } from "./docker-for-frontend-devs";
import { understandingRsc } from "./understanding-rsc";
import { cicdBasics } from "./cicd-basics";
import { debuggingNextjs } from "./debugging-nextjs";

export const manuals: Manual[] = [
  masteringGit,
  dockerForFrontendDevs,
  understandingRsc,
  cicdBasics,
  debuggingNextjs,
];

export function getManual(slug: string): Manual | undefined {
  return manuals.find((m) => m.slug === slug);
}
