# Codestash — Organizations, Roles & Billing Plan

Status: **agreed direction, locked in 2026-09-03. Nothing below is built yet** —
this is the plan the next phase of work should follow, not a description of
current behavior. See `md-docs/SETUP.md` for what's actually built today, and
`md-docs/roadmap/ROADMAP.md` for the sequencing that builds toward this design.

This grew out of a conversation about why sidebar drag-and-drop wasn't
working (turned out to be a missing `member` row for the one real
workspace, unrelated to roles or payment — see git history / that
conversation for the diagnosis). That led into a bigger question: what
should roles, organizations, and paid tiers actually look like here going
forward. This doc is the answer, written in plain language on purpose so
it stays readable as a source of truth, not just as commit-message
archaeology.

## Where the code stands today (as of this doc)

- The catalog (manuals/hooks/helpers/blocks/AI-instructions) is 100%
  DB-backed and org-scoped. **Reversed 2026-09-04:** it is no longer
  public — every route requires a real session (enforced in `proxy.ts`,
  plus a per-page server-verified check in each page, same
  belt-and-suspenders pattern as `app/(main)/onboarding/page.tsx`). A
  signed-out visitor is redirected to `/sign-in` and sees nothing. The
  earlier "browse with zero setup" idea may come back later as a
  genuinely separate, localStorage-only demo experience for free users —
  not the real DB-backed catalog — but that's a different architecture,
  not built.
- Sign-up, sign-in, and the workspace flow already work end-to-end against
  a real database: creating a workspace makes you its `owner`, you can
  invite people as `admin` or `member`, and they can accept the invite.
- Exactly **one** real organization exists right now — "Codestash" — and
  it was created by a direct database insert, not through the normal
  signup flow. That bypass is what caused the drag-and-drop bug: the
  normal flow auto-creates a `member` row for the creator, a raw insert
  doesn't.
- Categories can be dragged/reordered for any workspace that has
  categories seeded in the database — but there's still **no UI to create
  a category**. The only way one gets into the database today is a
  developer manually seeding it. Codestash is the only workspace that's
  been seeded.
- An `organization.plan` field already exists, defaulting to `"free"` —
  groundwork for exactly this kind of plan/feature-gating work, but
  **nothing in the code reads it yet.** It does nothing today.
- Being flagged as platform superadmin (the `admin` plugin's
  `adminRoles: ["superadmin"]`) is a manual, one-time, no-UI step today —
  not self-serve, not tied to any organization.
- Snippets (hooks/helpers/blocks/AI-instructions content) have a database
  table and are migrated in, but nothing reads from it yet — the live
  site still serves that content from static files.

## The plan

### 1. Platform superadmin

One role above every organization. Already wired up via better-auth's
`admin` plugin. **New rule:** only a superadmin can delete an
organization — not even an org's own owner can do that. (This is a
change from better-auth's default, where an org owner can delete their
own org.)

### 2. Organization = paying customer

Paying is the event that creates an organization. The first payer becomes
that org's owner/manager.

### 3. Org Plan (Dial A) — three plans, each priced by seat count

Three plans: **A** (premium, most features), **B** (middle, not detailed
yet), **C** (cheapest, fewest features).

Each plan scales with seat count rather than being a flat price, all
three following the same shape — front-loaded, flattening to a steady
per-seat rate — locked 2026-09-04:

| Seats | Plan A | Plan B | Plan C |
|---|---|---|---|
| 1 | $10 | $7 | $5 |
| 2 | $18 (+8) | $13 (+6) | $9 (+4) |
| 3 | $25 (+7) | $18 (+5) | $12 (+3) |
| 4th and beyond | +$7 each | +$5 each | +$3 each |

Each plan's steady-state marginal rate (A=$7, B=$5, C=$3) sets its
first-seat increment at marginal+$1, matching Plan A's own pattern
(marginal $7, first jump $8).

This dial controls whole-org feature ceilings: number of categories,
custom backgrounds/icons, number of invites, and similar — the exact
feature-to-plan mapping is still open.

### 4. Org Role (Dial B) — separate from the plan, 3 levels

Independent of plan/seat count. **Organization Manager** at the top (the
owner — full oversight), then **2 more levels underneath**. Whatever seat
a person fills (bought via the plan above), they also get one of these 3
roles, which governs what they personally can do inside the org (invite,
edit vs. view-only, etc.).

**Mapping, confirmed 2026-09-04:** reuses better-auth's existing
`owner`/`admin`/`member` roles rather than a second, parallel role
system — Organization Manager = `owner`, and the 2 previously-undefined
levels map to `admin` and `member`, using better-auth's built-in
permissions (invite/manage members = owner+admin, not member) as-is
rather than inventing new permission primitives.

### 5. Free / no-org users

An invited person isn't really "in" until they sign up through the invite
link and create an account — that's what turns "invited" into "can edit /
can view / whatever their role allows." Someone who never pays and is
never invited never gets an organization at all — and, as of the reversal
above, never sees any catalog content either. "Free" no longer means
"read-only public access"; it means no access, full stop, until invited
or paying.

### 6. Free trials — raised 2026-09-04; tier limits locked 2026-09-05

Raised while discussing what to build next: someone should be able to try
Codestash as if they were a paying org, for a limited time, without
handing over a card first. The mechanism/lifecycle questions below are
still open — this section exists so the idea doesn't get lost before
Phase 2 actually starts, not to pre-decide those. What *is* now locked:
**`trial` is a real `PlanTier` in `lib/config/plan-limits.ts`**, with its
own content-structure ceilings (see #7 below) — 2 categories, 10 sections
per manual, no custom backgrounds. `trial`'s limits also stand in for
`organization.plan`'s real-world default (`"free"`), since every org that
exists today — including the real Codestash workspace — sits on that
placeholder value until Phase 2 billing assigns it a real plan.

- **Likely mechanism:** Stripe's own trial-period support
  (`trial_period_days` on a subscription) rather than a separate,
  hand-rolled trial system — fits directly into Phase 2's already-locked
  "Stripe Checkout + subscriptions" approach instead of building a second,
  parallel path.
- **Open — needs a decision before building:** does starting a trial
  still require a card on file (common, reduces throwaway signups) or
  truly nothing upfront (lower friction, more abuse-prone)?
- **Open — needs a decision before building:** what happens at
  expiration — hard lock (no access at all until they pay), downgrade to
  a restricted read-only state, or a grace period before data becomes
  inaccessible? Each implies different code in the Stripe webhook handler
  Phase 2 already plans to build.
- **Open — needs a decision before building:** trial length, and whether
  it's the same for every plan (A/B/C) or varies.
- This is a third org-creation path alongside the two already described
  above (#2's "paying creates an org," #5's "invited into an existing
  one") — a trial org still needs an owner, still needs to occupy a real
  seat, but exists before any payment has actually happened.

### 7. Content-structure limits — locked 2026-09-05, revised same day (main/total split, per-plan depth, aggregate character budget)

Five ceilings live in the same `plan-limits.ts` config the seat/category
numbers already live in, born out of designing nesting for manual sections:

| Limit | Trial | Plan C | Plan B | Plan A |
|---|---|---|---|---|
| Max **main** sections per manual (top-level only) | 10 | 20 | 50 | Unlimited |
| Max **total** sections per manual (every level combined) | 270 | 540 | 1,350 | Unlimited |
| Max nesting depth | 4 | 6 | 8 | 10 |
| Max characters per section (fixed, every plan) | 8,000 | 8,000 | 8,000 | 8,000 |
| Max characters total per manual | 2,160,000 | 4,320,000 | 10,800,000 | Unlimited |

**Main and total sections are deliberately independent, not one number.**
A single "max sections" count (the original design) meant nesting at all
quietly ate into how many distinct top-level topics a manual could
cover — the two competed for the same budget. Splitting them means a
manual can spend its total budget either on more top-level topics or on
deeper structure under fewer of them, and nesting never costs you
breadth. The total number is deliberately generous (main × depth³ at the
original 3-per-level branching assumption, e.g. 10 × 3³ ≈ 270 for trial)
— a ceiling on absolute complexity, not something a normal manual would
realistically approach; **main** is the number that actually shapes
everyday use.

**Nesting depth now scales by plan** (revised 2026-09-05 — reversed from
the original "same for everyone" call) — a real per-plan perk, not just a
legibility constant anymore, though 4 levels stays the practical floor
even on trial.

**Characters work the same two-tier way as sections**: `maxCharsPerSection`
(8,000) is a fixed, per-bullet hard ceiling for every plan — it stops one
bullet from becoming the entire manual, which is exactly the failure mode
a pure aggregate-only budget would reopen. `maxTotalCharsPerManual` is the
plan-scaled aggregate on top of it (`maxCharsPerSection × maxTotalSectionsPerManual`
for each tier), giving real flexibility *across* bullets — some longer,
some shorter, up to the shared pool — without allowing it *within* one.
Someone who genuinely has one thing that shouldn't be split (a long
explanation, a full file) gets real room; nobody can spend the whole
manual's budget on a single unreadable wall of text.

Enforcement for all the plan-scaled numbers (main sections, total
sections, depth, total characters) is runtime
(`assertWithinSectionLimits` in `manual-actions.ts`, comparing against
`getOrgPlanLimits(organization.plan)`), not baked into the Zod validation
schemas, since the schemas can't know which org is submitting — same
separation of concerns `requireOrgRole` already uses for permissions.
Only `maxCharsPerSection`, the one number that's still identical for
every plan, lives directly in the Zod schema.

## What's missing to make this plan real

Not a wishlist of every detail — just what's actually load-bearing before
any of the above can work:

- **An actual payment processor.** Nothing charges anyone anything today.
  Point 2 ("paying creates an org") has no engine behind it — needs a
  real biller (Stripe is the standard choice) to handle checkout, the
  per-seat math, and the ongoing stuff (renewals, adding a 4th seat
  mid-month, a card failing).
- **A single source of truth for what each plan includes.** The `plan`
  field exists but nothing checks it. Before any feature can be
  "Plan A only," there needs to be one clear list of what each plan
  includes, and every gated feature has to actually check against it.
  Doesn't exist yet, not even as a draft.
- **Seat counting and enforcement.** If pricing is per-seat, something
  needs to compare how many people are actually in an org against what
  they're paying for — otherwise a 1-seat plan could invite 10 people for
  free.
- **Actual permission checks for the org roles.** Today the only
  role-based restrictions that exist at all are better-auth's built-in
  ones (who can invite, who can delete the org). Nothing in this app's
  own code checks role for anything — not category reordering, nothing.
  The 2 extra role levels won't restrict anything on their own; whatever
  they're supposed to gate has to be coded in explicitly.
- **The "create a workspace" flow needs to change shape.** Today it's
  just typing a name. Under this plan it becomes picking a plan (A/B/C)
  and paying for it — a materially bigger flow than what exists now.
