# Phase 3 — Core Product Completeness

Right now there is no create/edit UI for manuals or snippets, for any
role, and the public pages are hardcoded to static content regardless of
what's in the database. This phase closes both gaps.

## Locked decisions

- **One shared editor for manuals and snippets** — since snippets already
  got merged into the manual table's shape (one section, one code
  block), there's no separate snippet-specific editor to build.
- **Public pages switch from "static unconditionally" to "DB first,
  static fallback"** — matching the pattern `[category]/[subpage]/page.tsx`
  already uses for subpages (check DB before static). Apply the same
  pattern to the top-level list pages (`/`, `/[category]`) for
  consistency, rather than inventing a different rule for them.
- **Delete is soft, not hard** — a status field, not a row removal.
  Reversible, matches normal SaaS behavior, and avoids permanently
  losing content to a misclick.

## Checklist

- [ ] Build the manual/snippet create form (title, sections, code blocks)
- [ ] Build edit — same form, pre-filled from the existing row
- [ ] Build soft-delete (status field + filter it out of normal queries)
- [ ] Update `/` and `/[category]` to query DB content first, falling back to static only when nothing exists in the DB
- [ ] Icon picker — any lucide-react icon, replacing the small curated set in `lib/icon-map.ts`
- [ ] Background theme presets — a small fixed set to start, not custom uploads

## Deferred, on purpose

- Rich text / WYSIWYG editing — start with plain textarea + markdown, upgrade later if it's actually needed.
- Custom background image uploads — presets only for now.

## Exit condition

A workspace's content is fully self-service — no developer needs to
touch a static file or run a seed script for a real workspace to have
real content.
