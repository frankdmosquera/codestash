# Codestash — Roadmap to Success

Status: expanded 2026-09-03 on `claude-redesign`, merged to `main` and
deployed same day. This is the index —
current state, the principles behind the sequencing, and a phase-by-phase
map. Each phase's full detail (locked decisions, checklist, deferred
items, exit condition) lives in its own file under `roadmap/`, kept
short and searchable rather than one long document. Read alongside
`STORY.md` (how we got here) and `ROLES-AND-BILLING-PLAN.md` (the
org/role/plan design this builds toward).

This is written as if Codestash is going to be a real, paying-customer
product — not a personal tool that happens to have a database attached.

**Note on scope:** only `ROADMAP.md` (this index) is auto-loaded into
every session via `CLAUDE.md`'s `@import`. The seven phase files under
`roadmap/` are read on demand when actually working on that phase — kept
out of the always-loaded context on purpose, so a session touching
Phase 4 doesn't have to load Phase 2's billing detail it doesn't need.

## The honest current state

Not the optimistic version. Last updated 2026-09-03:

- A real DB/auth layer — sign-up, sign-in, workspaces, invites, all
  working end-to-end. **The catalog itself is 100% DB-backed now, with
  zero static content left anywhere** (`lib/data/` holds only shared
  types) — fixed 2026-09-04: the home page (`app/(main)/page.tsx`) was
  still rendering a hardcoded `CATEGORY_LIST`, showing every visitor the
  same 5 built-in category cards regardless of their actual org, an
  oversight from the original DB migration. Also reversed the same day:
  the catalog is no longer public — every route requires a real session
  (`proxy.ts` + a per-page server-verified check), a signed-out visitor is
  redirected to `/sign-in`. See `ROLES-AND-BILLING-PLAN.md` #5.
- **Exactly one real organization exists**, created by a direct database
  insert — no repeatable path exists yet for a second one.
- **Production was live but broken, now fixed** — `/` and every
  `/api/auth/*` call were 500ing because `NEXT_PUBLIC_APP_URL` in
  Vercel's Production env vars was missing its `https://` scheme.
  Corrected and confirmed returning 200, 2026-09-03.
- **CI now runs on every push** (`.github/workflows/ci.yml` — lint,
  `tsc --noEmit`, build) — still zero automated test suite; that's
  Phase 6, not this. CI's build step needs `DATABASE_URL`,
  `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` added as GitHub Actions
  repo secrets before it can actually pass — not yet confirmed done.
- **Zero billing** — nothing charges anyone anything today.
- The roles/plan model's shape is decided on paper (Plan A's seat
  pricing, the 3-role structure) — Plan B/C's numbers and the 2 non-owner
  role levels are still explicitly TBD — and **zero of it is enforced in
  code** either way, beyond better-auth's built-in defaults.
- No "create category" UI, and no create/edit UI for manuals or
  snippets, for any role.

## Principles — corrections, not just a continuation

Named specifically so they don't repeat under a new coat of paint. Each
phase's locked decisions trace back to one of these.

1. **Stop creating state by hand.** The org, its categories, and (until
   recently) its owner membership were all created by direct inserts or
   one-off scripts — that exact pattern broke sidebar drag-and-drop.
   Nothing gets created except through the app's real flow, including in
   development.
2. **Build the permission/plan-limit layer before more features.** Every
   feature shipped so far went in with no thought to who's allowed to do
   it — backwards for a product whose business model is tiered, paid
   plans.
3. **Billing earlier than feels comfortable.** "Paying creates an
   organization" is the foundation the whole design sits on. An ugly,
   working checkout beats a beautiful app with no way to charge anyone.
4. **Fix what's live before designing what's next.** An unresolved
   production outage sat underneath this entire plan — Phase 0 exists
   because of it, and is now resolved.
5. **Bring in a safety net exactly when the stakes go up.** No tests, no
   CI is fine for a personal tool. It stops being fine once plans,
   seats, and permissions gate what real people can do and pay for.

## The phases

| # | Phase | Exit condition | Detail |
|---|---|---|---|
| 0 | **Stabilize** — nearly done, *you are here* | Production serves every route without a 500 (✓); broken builds can't merge silently (pending CI repo secrets) | [roadmap/00-stabilize.md](roadmap/00-stabilize.md) |
| 1 | Foundations | No org/category/membership is ever created outside the app's own code paths | [roadmap/01-foundations.md](roadmap/01-foundations.md) |
| 2 | Billing | A second real, paying org can exist without a developer touching the database | [roadmap/02-billing.md](roadmap/02-billing.md) |
| 3 | Core product completeness | A workspace's content is fully self-service | [roadmap/03-core-product.md](roadmap/03-core-product.md) |
| 4 | Team features | A member's capabilities are governed by their role, not just membership | [roadmap/04-team-features.md](roadmap/04-team-features.md) |
| 5 | Polish — original UX work | The sidebar UX work done right, with real architecture underneath | [roadmap/05-polish.md](roadmap/05-polish.md) |
| 6 | Scale readiness | Ready to hold up under real, paying usage | [roadmap/06-scale-readiness.md](roadmap/06-scale-readiness.md) |

One decision in the phase details is still flagged as
**confirm-before-building** rather than fully locked: the Stripe/Vitest
choices (Phases 2 and 6). The Organization Manager → better-auth role
mapping (Phase 1) was confirmed 2026-09-04. Everything else in each phase
file is written to be built as-is, not re-debated.

## Infra independence

None of the above depends on staying on Neon or Vercel. The org/role/plan
model, the permission-check pattern, and the billing hook points are the
same regardless of what's underneath. The one discipline required: keep
database access behind `lib/db` and `lib/actions`, and auth behind
`lib/auth` — so a future move (Neon → Appwrite, Vercel → Cloudflare)
only touches those adapter layers, never the business logic on top.

## Where this leaves us

Phase 0's checklist is done except confirming the CI repo secrets are
added — the rest of that phase (the prod outage, CI itself) is fixed and
live. The static-to-DB migration wasn't originally scoped as a Phase 0
item, but it's done too, ahead of its natural home in Phase 3. The
sequencing for what's left is still deliberate — foundations before
billing, billing before more product surface, product before team
features, team features before polish, polish before hardening. Skipping
ahead (more UI before the permission layer exists, for instance) is
exactly the pattern this roadmap exists to correct.

## Bringing this into the app itself

Done, not just planned — this file and the `roadmap/` phase files are
browsable in-app as the "Roadmap to Success" manual under the
`codestash` category (`scripts/seed-roadmap-manual.ts` seeded it,
`scripts/update-roadmap-manual.ts` re-syncs it — re-run that one whenever
this file or `roadmap/*.md` change, the same discipline STORY.md,
SETUP.md, and ROLES-AND-BILLING-PLAN.md need via
`scripts/seed-doc-family-manuals.ts`, though that one isn't re-runnable
yet — see the note in Claude's memory / ask it to build the update
version of that script too if it's drifted).
