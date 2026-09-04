// One-time: adds a "Codestash's Own Setup (Case Study)" section to the
// existing "cicd-basics" manual, as a third sibling under "A Real GitHub
// Actions Workflow" (alongside "Lint + typecheck + build on every PR" and
// "Splitting into parallel jobs") — grounds that section's generic example
// in this project's actual .github/workflows/ci.yml, added 2026-09-03.
// Run with: npx tsx --env-file=.env.local scripts/add-cicd-case-study-section.ts
//
// Safe to re-run: skips if a section with this title already exists.

import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { section } from "../lib/db/schema/app-schema";
import type { ContentBlock } from "../lib/data/types";

const PARENT_ID = "cbb1564d-01df-4d3e-a036-ffa45e75b6a3"; // "A Real GitHub Actions Workflow"
const TITLE = "Codestash's Own Setup (Case Study)";

const blocks: ContentBlock[] = [
  {
    type: "p",
    text: "This project's own workflow — added 2026-09-03, the real file at `.github/workflows/ci.yml`, not a hypothetical. It differs slightly from the generic example above: it runs on **every push to any branch**, not just PRs targeting `main` (catches breakage before it's even proposed for merge, not just at merge time), and it injects three repo secrets the build step actually needs.",
  },
  {
    type: "code",
    code: `name: CI

on:
  push:
    branches: ["**"]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: \${{ secrets.DATABASE_URL }}
      BETTER_AUTH_SECRET: \${{ secrets.BETTER_AUTH_SECRET }}
      NEXT_PUBLIC_APP_URL: \${{ secrets.NEXT_PUBLIC_APP_URL }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run lint

      - run: npx tsc --noEmit

      - run: npm run build`,
  },
  {
    type: "p",
    text: "Why those three specifically: `npm run build` compiles the whole app, and several routes import `lib/auth.ts` and `lib/db/index.ts` — both throw if their env vars are missing, the same way the app itself would locally. It's a build-time requirement, not a statement about auth being finished as a feature. See **Repository secrets** above for the general mechanism (`Settings → Secrets and variables → Actions`) — the values themselves come from this repo's own `.env.local`, added one at a time.",
  },
  {
    type: "note",
    text: "This is also the exact workflow that caught nothing wrong the first few times — CI passing doesn't mean production is healthy. This project's own prod outage (a misconfigured `NEXT_PUBLIC_APP_URL` in Vercel, missing its `https://` scheme) was a config issue CI never would have caught, since it only runs against a build, not the deployed environment. CI and \"is prod actually working\" are two different questions.",
  },
];

async function main() {
  const existing = await db.query.section.findFirst({
    where: and(eq(section.parentId, PARENT_ID), eq(section.title, TITLE)),
  });
  if (existing) {
    console.log(`Section "${TITLE}" already exists (${existing.id}) — nothing to do.`);
    return;
  }

  const siblings = await db.query.section.findMany({
    where: eq(section.parentId, PARENT_ID),
  });
  siblings.sort((a, b) => a.rank.localeCompare(b.rank));
  const lastRank = siblings.at(-1)?.rank ?? null;
  const rank = generateKeyBetween(lastRank, null);

  const manualId = siblings[0]?.manualId;
  if (!manualId) throw new Error("Could not determine manualId from existing siblings.");

  await db.insert(section).values({
    id: crypto.randomUUID(),
    manualId,
    parentId: PARENT_ID,
    rank,
    title: TITLE,
    blocks,
  });

  console.log(`Added "${TITLE}" under parent ${PARENT_ID} at rank ${rank}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
