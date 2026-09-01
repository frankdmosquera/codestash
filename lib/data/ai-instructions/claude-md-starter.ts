import type { Snippet } from "../types";

export const claudeMdStarter: Snippet = {
  slug: "claude-md-starter",
  title: "CLAUDE.md Starter Template",
  description:
    "A well-organized starter CLAUDE.md for a general web project — overview, stack, commands, conventions, and guardrails.",
  createdAt: "2026-08-24",
  code: `# CLAUDE.md

This file gives Claude Code (and other AI coding assistants) the context it
needs to work in this repo effectively. Keep it short, accurate, and update
it whenever a convention changes — a stale CLAUDE.md is worse than none.

## Project Overview

<One or two sentences: what this product does and who it's for.>

- **Type:** <e.g. B2B SaaS dashboard, marketing site, internal tool>
- **Status:** <e.g. pre-launch, in production, actively maintained>
- **Primary users:** <who interacts with this app>

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Data/DB:** <e.g. Postgres via Prisma, Supabase>
- **Auth:** <e.g. NextAuth, Clerk>
- **Deployment:** <e.g. Vercel>
- **Package manager:** <npm / pnpm / yarn — pick one and be consistent>

## Commands

Run these from the project root:

\`\`\`bash
npm run dev        # start the dev server on localhost:3000
npm run build      # production build
npm run start      # run the production build locally
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run test        # unit tests
npm run test:watch  # unit tests in watch mode
\`\`\`

Always run \`lint\` and \`typecheck\` before considering a change done. Run the
relevant test file after touching logic, not just at the end of a session.

## Code Style & Conventions

- TypeScript everywhere; avoid \`any\` — use \`unknown\` and narrow it, or a
  proper type.
- Functional React components only. No class components.
- Co-locate a component's styles/tests/types next to the component file.
- Prefer named exports over default exports, except for Next.js pages/routes
  and layout files, which must use default exports.
- Server Components by default; add \`"use client"\` only when the file
  actually needs interactivity, state, or browser-only APIs.
- Keep files under ~300 lines; split a component when it grows past that.
- Use early returns over nested conditionals.
- Name booleans with an \`is\`/\`has\`/\`should\` prefix (\`isLoading\`, not
  \`loading\`).
- Errors are handled explicitly — no silent \`catch {}\` blocks.

## Things to Avoid

- Do not add new dependencies without checking if an existing one already
  covers the need.
- Do not commit \`.env*\` files or hardcode secrets/API keys.
- Do not run destructive git commands (\`push --force\`, \`reset --hard\`,
  \`clean -f\`) without explicit confirmation.
- Do not modify generated files (anything under \`.next/\`, \`node_modules/\`,
  or files with a "DO NOT EDIT" header) by hand.
- Do not introduce new state management libraries — use React state/context
  or the existing store; ask before reaching for something new.
- Do not disable lint rules or type errors with inline comments as a
  shortcut — fix the underlying issue or ask first.
`,
};
