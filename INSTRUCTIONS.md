# Manuals feature — Mastering Git

Everything here assumes `components/ui/accordion.tsx`, `button.tsx`, and `input.tsx` already
exist from your `npx shadcn@latest add --all` run, and that your `@/*` import alias points at
the project root (standard shadcn setup — no changes needed there).

## Where each folder goes

- `helpers/parse-inline.tsx` → your project's `helpers/` folder (regular, non-server helper)
- `features/manuals/` → your project's `features/` folder, as-is
- `app-manuals/` → **rename this to `app/manuals/`** when you copy it in (called it
  `app-manuals` here just so it wouldn't collide with your existing `app/` folder in the zip)

## Resulting structure

```
helpers/
  parse-inline.tsx

features/
  manuals/
    index.ts                       ← what app/ routes import from
    content/
      types.ts
      mastering-git.ts             ← the actual manual content
      index.ts                     ← registry of all manuals
    components/
      code-block.tsx               ← copy-button code block
      manual-accordion.tsx         ← recursive accordion (built on components/ui/accordion)
      manual-explorer.tsx          ← search + expand/collapse-all
      manual-page.tsx              ← composes title + explorer

app/
  manuals/
    page.tsx                       ← lists all manuals
    mastering-git/
      page.tsx                     ← renders this one manual
```

## One thing to check

`manual-accordion.tsx` assumes your generated `components/ui/accordion.tsx` supports a
controlled `value` / `onValueChange` pair as `string[]` (so multiple sections can be open at
once — that's what lets nested sections and "expand all" work). This matched the docs when I
checked, but the Base UI codegen can vary by shadcn version — if you get a type error on
`value`/`onValueChange`, open that file and tell me what the actual prop names/types are and
I'll adjust.

## Run it

```bash
npm run dev
```

Then visit `/manuals` and `/manuals/mastering-git`.
