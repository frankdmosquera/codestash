# Phase 1 — Foundations

The architecture layer. Nothing in Phase 2 onward gets built until this
exists, because every later phase depends on being able to answer "is
this person allowed to do this" and "does this org's plan allow this."

## Locked decisions

- **Plan limits live in one config file** (`lib/config/plan-limits.ts`),
  not scattered checks across features. One object, keyed by plan
  (`A`/`B`/`C`), holding every capped value: max categories, custom
  backgrounds allowed (bool), seat allowance (drawn from the pricing
  curve in `ROLES-AND-BILLING-PLAN.md`). Every future plan-gated feature
  reads from this file — never hardcodes a limit inline.
- **Permission checks go through one reusable helper**
  (`requireOrgRole(session, allowedRoles)`), called at the top of every
  org-scoped server action. No per-action bespoke permission logic.
- **Category creation gets a real path** — a form + server action
  (`createCategoryAction`). Manual DB seeding is retired for good; the
  existing seed scripts stay in the repo only as a historical record of
  how the first (and only) real workspace got its categories.
- **Resolving the "2 TBD role levels" from `ROLES-AND-BILLING-PLAN.md`:**
  reuse better-auth's existing `owner`/`admin`/`member` roles rather than
  building a second, parallel role system. Organization Manager = `owner`.
  The two undefined levels map to `admin` and `member` respectively,
  using better-auth's existing built-in permissions (invite/manage
  members = owner+admin, not member) as the starting point rather than
  inventing new permission primitives. **Confirm before building** — it's
  the right default, but it's your call to keep or override.
- **A seat = any active member of the org, including the owner.** The
  owner occupies seat 1, not a free extra slot on top of the plan's
  count. Closes an ambiguity that would otherwise cause an off-by-one
  disagreement between `getSeatUsage` and whatever Phase 2's checkout
  charges for.
- **`organization:delete` gets removed from the `owner` role and
  reserved for the platform superadmin**, implementing the rule already
  locked in `ROLES-AND-BILLING-PLAN.md` #1 (better-auth's default lets an
  owner delete their own org — this overrides that default). This was
  decided in the roles doc but nothing in this roadmap built it until
  now, so it's called out explicitly here rather than assumed.

## Checklist

- [x] Lock Plan B and Plan C's actual seat-pricing numbers (currently
      TBD in `ROLES-AND-BILLING-PLAN.md`) — `plan-limits.ts` can't be
      called complete with placeholder values in it
- [x] Create `lib/config/plan-limits.ts` defining limits for plans A/B/C
- [x] Build `getSeatUsage(orgId)` — counts active members, owner included, against the plan's seat allowance
- [x] Build `requireOrgRole(session, allowedRoles)` helper
- [x] Retrofit `reorderCategoryAction` to call it (it currently has zero role check)
- [x] Override better-auth's org access control so `organization:delete` is not in the `owner` role's permission set
- [x] Build `createCategoryAction` + a minimal "add category" form
- [x] Document the Organization Manager → `owner`/`admin`/`member` mapping directly in `ROLES-AND-BILLING-PLAN.md` once confirmed
- [x] Confirm no seed script gets run again for any workspace other than as a documented historical fix — every account/org/membership created this session went through better-auth's own signUpEmail/addMember/createOrganization APIs, never a raw insert

## Deferred, on purpose

- Icon picker / background theme UI polish for category creation — Phase 3.
- Anything about billing itself — Phase 2, though this phase's plan-limits config is what Phase 2's checkout will write into.
- **Enforcing the seat cap in the invite flow, specifically — deferred to
  Phase 2, 2026-09-04.** There's no `seatsPurchased` (or similar) field
  on an org to enforce against — that only gets created at checkout,
  which doesn't exist yet. Building a stopgap cap now (e.g. hard-limit
  to 1 seat) would break real, already-tested functionality (Codestash
  already has 2 real members by design) to enforce a number that isn't
  real yet. Not reattempting until Phase 2 creates that field — this is
  the one item Phase 1 doesn't actually close out itself; it's
  structurally a Phase 2 dependency, not an oversight, which is why it's
  listed here rather than left unchecked on the checklist above.

## Exit condition

No organization, category, or membership row for any _future_ workspace
is ever created outside the app's own code paths. Met — everything
created this session (test members, the second org) went through real
better-auth APIs.
