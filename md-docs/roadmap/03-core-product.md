# Phase 3 — Core Product Completeness

**Create/edit UI for manuals and snippets shipped 2026-09-04** — flat,
single-block sections only for v1 (see the checklist below for the exact
scope and its deliberate limitation). **Soft-delete and nesting both
shipped 2026-09-05** (see below); one block per section is still the
limit — no lists/notes, no multiple blocks in one section. Icon/background
pickers are still open. (The other original gap — public pages hardcoded
to static content — is already closed, done ahead of schedule 2026-09-03
as part of the static-to-DB migration; see below.) Per-document sharing
also shipped 2026-09-05, outside this phase's original scope — see
`SETUP.md`'s "Where things stand" for the full writeup.

## Locked decisions

- **One shared editor for manuals and snippets** — since snippets already
  got merged into the manual table's shape (one section, one code
  block), there's no separate snippet-specific editor to build.
- ~~Public pages switch from "static unconditionally" to "DB first,
  static fallback"~~ — done 2026-09-03, and taken further than originally
  planned: there's no static fallback left at all anymore, anywhere
  (`lib/data/` holds only shared types). Every read — subpages, category
  pages, the homepage's cards, sidebar, search — is DB-only. **Update
  2026-09-04:** the public-org fallback for signed-out visitors
  (`getPublicOrganizationId()`) was itself reversed and deleted — every
  route now requires a real session, no exceptions. See
  `ROLES-AND-BILLING-PLAN.md` #5.
- **Delete is soft, not hard** — a status field, not a row removal.
  Reversible, matches normal SaaS behavior, and avoids permanently
  losing content to a misclick.

## Checklist

- [x] Build the manual/snippet create form (title, sections, code blocks)
      — done 2026-09-04, flat single-block sections only (no nesting, no
      multi-block sections); richer editing is future work, not this pass
- [x] Add nesting to the create/edit form — done 2026-09-05: each section
      row carries a `depth`, with Indent/Outdent controls and a live
      dotted-number breadcrumb; `assignSectionParents` converts the flat
      depth-tagged list into real `parentId` rows on save (same stack-walk
      shape as `markdown-to-manual-sections.ts`'s heading-level parsing).
      Multi-block sections (lists/notes, more than one block per section)
      remain out of scope — this was depth only, not the whole v1
      limitation. Came with five caps in `plan-limits.ts`, revised same
      day (max main sections and max total sections — independent, so
      nesting never costs top-level breadth; max depth, now scaled by
      plan too — trial 4, C 6, B 8, A 10; max characters per section,
      fixed at 8,000 for every plan; max characters total per manual, a
      plan-scaled aggregate budget on top of it — see
      `ROLES-AND-BILLING-PLAN.md` #7), shown live as graduated
      muted/amber/red meters and a depth tooltip, so they're seen coming
      rather than hit as a wall.
- [x] Build edit — same form, pre-filled from the existing row — done
      2026-09-04, but only offered when the manual's real structure is
      actually flat-compatible (`lib/helpers/manual-edit-compat.ts`);
      existing richer manuals (this roadmap, `mastering-git`, etc.) show
      no Edit button rather than risk silently destroying their structure
- [x] Build soft-delete (status field + filter it out of normal queries)
      — done 2026-09-05: `manual.deletedAt` (nullable timestamp, null =
      active), filtered out of every read path (category listing/sidebar,
      search, manual-by-slug); `deleteManualAction` sets it, owner/admin
      only via `requireOrgRole`; a Delete button + confirmation dialog
      sits next to Edit on both the manual page and the snippet page —
      shown regardless of the flat-structure Edit restriction, since
      deleting doesn't touch a manual's internal shape the way editing
      through the v1 form would
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
