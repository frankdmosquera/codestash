import type { Snippet } from "../types";

export const cursorRulesNextjs: Snippet = {
  slug: "cursor-rules-nextjs",
  title: "Cursor Rules for a Next.js Project",
  description:
    "A .cursorrules file encoding App Router, server/client component, styling, and file-naming conventions.",
  code: `You are working in a Next.js (App Router) + TypeScript + Tailwind CSS
codebase. Follow these rules for every change you make or suggest.

## App Router

- Assume the \`app/\` directory (App Router), not \`pages/\`. Route files are
  \`page.tsx\`, \`layout.tsx\`, \`loading.tsx\`, \`error.tsx\`, \`route.ts\`.
- Fetch data directly inside Server Components with \`async\`/\`await\` — do
  not add a client-side \`useEffect\` fetch when a server fetch will do.
- Use \`route.ts\` handlers (\`GET\`, \`POST\`, etc.) for API endpoints, not the
  old \`pages/api\` convention.
- Co-locate a route's UI, loading, and error states in the same route
  segment folder.
- Use \`generateMetadata\` for dynamic \`<head>\` content instead of a client
  component that mutates \`document.title\`.

## Server vs. Client Components

- Default to Server Components. Only add \`"use client"\` at the top of a
  file when it needs:
  - React state or effects (\`useState\`, \`useEffect\`, \`useReducer\`)
  - Browser-only APIs (\`window\`, \`localStorage\`, event listeners)
  - Third-party libraries that themselves require the client
- Push \`"use client"\` as far down the tree as possible — wrap only the
  interactive leaf, not the whole page.
- Never import server-only code (database clients, secrets, \`fs\`) into a
  file marked \`"use client"\`.
- Pass data down from Server Components as props rather than fetching the
  same data again in a client component.

## Styling

- Tailwind CSS only — no CSS Modules, styled-components, or inline
  \`style={{}}\` unless a value is truly dynamic and can't be expressed as a
  class.
- Use the \`cn()\` (clsx + tailwind-merge) helper for conditional classes
  instead of string concatenation or template literals.
- Keep utility class lists readable: layout → spacing → typography → color
  → state variants, roughly in that order.
- Extract a class list into a variable or a small component when it grows
  past ~8–10 utilities and is reused more than once.
- Use design tokens from \`tailwind.config.ts\` (spacing, colors, radii)
  instead of arbitrary values like \`w-[437px]\` unless there's no token
  that fits.

## File Naming & Structure

- Component files: \`kebab-case.tsx\`, exporting a \`PascalCase\` component
  that matches the file's purpose (\`user-avatar.tsx\` → \`UserAvatar\`).
- One component per file, except tiny private sub-components used only by
  their parent.
- Hooks live in \`hooks/\` and are named \`use-thing.ts\` exporting
  \`useThing\`.
- Shared types go in \`types.ts\` or a \`types/\` folder, not scattered inline
  across components that need them.
- Use the \`@/\` path alias for imports outside the current directory
  instead of long relative \`../../../\` chains.

## General

- Prefer editing an existing file over creating a new one.
- Don't introduce a new dependency for something the standard library or an
  existing dependency already covers.
- Keep PRs/diffs focused — don't reformat or refactor unrelated code while
  making an unrelated change.
`,
};
