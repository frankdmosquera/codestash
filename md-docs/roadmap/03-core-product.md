# Phase 3 — Core Product Completeness

Right now there is no create/edit UI for manuals or snippets, for any
role. This phase closes that gap. (The other original gap — public pages
hardcoded to static content — is already closed, done ahead of schedule
2026-09-03 as part of the static-to-DB migration; see below.)

## Locked decisions

- **One shared editor for manuals and snippets** — since snippets already
  got merged into the manual table's shape (one section, one code
  block), there's no separate snippet-specific editor to build.
- ~~Public pages switch from "static unconditionally" to "DB first,
  static fallback"~~ — done 2026-09-03, and taken further than originally
  planned: there's no static fallback left at all anymore, anywhere
  (`lib/data/` holds only shared types). Every read — subpages, category
  pages, the homepage's cards, sidebar, search — is DB-only, with a
  public-org fallback (`getPublicOrganizationId()`) so a signed-out
  visitor still sees it without needing a session.
- **Delete is soft, not hard** — a status field, not a row removal.
  Reversible, matches normal SaaS behavior, and avoids permanently
  losing content to a misclick.

## Checklist

- [ ] Build the manual/snippet create form (title, sections, code blocks)
- [ ] Build edit — same form, pre-filled from the existing row
- [ ] Build soft-delete (status field + filter it out of normal queries)
- [x] Update `/` and `/[category]` to query DB content — done 2026-09-03, no static fallback left at all (further than the original "fallback when empty" plan)
- [ ] Icon picker — any lucide-react icon, replacing the small curated set in `lib/icon-map.ts`
- [ ] Background theme presets — a small fixed set to start, not custom uploads

## Deferred, on purpose

- Rich text / WYSIWYG editing — start with plain textarea + markdown, upgrade later if it's actually needed.
- Custom background image uploads — presets only for now.

## Exit condition

A workspace's content is fully self-service — no developer needs to
touch a static file or run a seed script for a real workspace to have
real content.
