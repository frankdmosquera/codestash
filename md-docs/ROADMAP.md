# Codestash — Roadmap to Success

Status: expanded 2026-09-03 on `claude-redesign`. This is the index —
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

Not the optimistic version:

- A working static catalog plus a real DB/auth layer — sign-up, sign-in,
  workspaces, invites, all working end-to-end.
- **Exactly one real organization exists**, created by a direct database
  insert — no repeatable path exists yet for a second one.
- **Production is live but broken** — `/` and every `/api/auth/*` call
  were 500ing as of the last check, root cause not yet found.
- **Zero tests, zero CI** anywhere in the repo — verified, not assumed.
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
   production outage sits underneath this entire plan — Phase 0 exists
   because of it.
5. **Bring in a safety net exactly when the stakes go up.** No tests, no
   CI is fine for a personal tool. It stops being fine once plans,
   seats, and permissions gate what real people can do and pay for.

## The phases

| # | Phase | Exit condition | Detail |
|---|---|---|---|
| 0 | **Stabilize** — *you are here* | Production serves every route without a 500; broken builds can't merge silently | [roadmap/00-stabilize.md](roadmap/00-stabilize.md) |
| 1 | Foundations | No org/category/membership is ever created outside the app's own code paths | [roadmap/01-foundations.md](roadmap/01-foundations.md) |
| 2 | Billing | A second real, paying org can exist without a developer touching the database | [roadmap/02-billing.md](roadmap/02-billing.md) |
| 3 | Core product completeness | A workspace's content is fully self-service | [roadmap/03-core-product.md](roadmap/03-core-product.md) |
| 4 | Team features | A member's capabilities are governed by their role, not just membership | [roadmap/04-team-features.md](roadmap/04-team-features.md) |
| 5 | Polish — original UX work | The sidebar UX work done right, with real architecture underneath | [roadmap/05-polish.md](roadmap/05-polish.md) |
| 6 | Scale readiness | Ready to hold up under real, paying usage | [roadmap/06-scale-readiness.md](roadmap/06-scale-readiness.md) |

Two decisions in the phase details are flagged as **confirm-before-building**
rather than fully locked: the Organization Manager → better-auth role
mapping (Phase 1) and the Stripe/Vitest choices (Phases 2 and 6). Everything
else in each phase file is written to be built as-is, not re-debated.

## Infra independence

None of the above depends on staying on Neon or Vercel. The org/role/plan
model, the permission-check pattern, and the billing hook points are the
same regardless of what's underneath. The one discipline required: keep
database access behind `lib/db` and `lib/actions`, and auth behind
`lib/auth` — so a future move (Neon → Appwrite, Vercel → Cloudflare)
only touches those adapter layers, never the business logic on top.

## Where this leaves us

Phase 0, just starting. The sequencing is deliberate — foundations
before billing, billing before more product surface, product before team
features, team features before polish, polish before hardening. Skipping
ahead (more UI before the permission layer exists, for instance) is
exactly the pattern this roadmap exists to correct.

## Later: bringing this into the app itself

Once this plan is solid and not actively changing, the goal is to make
it a subpage under the Manuals category in Codestash itself — browsable
and searchable in-app, the same way the "next16-neon-better-auth" manual
already works. Not started yet; this file and `roadmap/` are the staging
ground for that content.
