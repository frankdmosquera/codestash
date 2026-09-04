# Codestash — Project Setup &amp; Context

A personal dev reference catalog (manuals, hooks, helpers, blocks, AI
instructions), built on Next.js + shadcn. Being migrated from static
`lib/data/*.ts` files onto Neon + Drizzle + Better Auth — see
`lib/data/manuals/next16-neon-better-auth.ts` (the "next16-neon-better-auth"
manual, browsable in the app itself) for the full roadmap and rationale.
This file is the practical "get it running" guide, kept in sync as the
project evolves — see `folder-structure.txt` for the current file layout.

## Prerequisites

- Node.js + npm
- A [Neon](https://neon.tech) account (free tier is fine) once you get to the
  database steps below — not needed just to browse the static catalog.

## Install

```bash
npm install
```

## Run the dev server (static catalog only)

```bash
npm run dev
```

Visit `/` to browse categories, or any manual directly, e.g. `/manuals/mastering-git`.
This works with zero setup — the catalog currently reads straight from the
static files in `lib/data/`, no database required yet.

## Database setup (Neon + Drizzle)

1. Create a Neon project at neon.tech and grab the **pooled** connection string.
2. Add it to `.env.local` (create the file if it doesn't exist):

   ```
   DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"
   ```

3. Push the schema (creates every table from `lib/db/schema/auth-schema/` and `lib/db/schema/app-schema/`):

   ```bash
   npx drizzle-kit push
   ```

   Use `npx drizzle-kit generate` + versioned migrations instead once
   more than one person depends on the schema not shifting underneath them.

## Auth (Better Auth)

`lib/auth.ts` configures Better Auth with the `admin` plugin (platform-level
super admin, you), `organization` plugin (workspaces — owner / admin /
member roles, plus invites — see below), and `emailOTP` plugin ("just
email" sign-in via a 6-digit code). Both `sendVerificationOTP` and
`sendInvitationEmail` currently only log to the server console — no real
email provider is wired up yet; `baseURL` is set explicitly (`.env`'s
`NEXT_PUBLIC_APP_URL`, falling back to `http://localhost:3000`) since
invite links are built from it. The Next.js route
handler lives at `app/api/auth/[...all]/route.ts` and is the one real API
route in the app — every other mutation goes through server actions, not
routes. Form validation schemas live in `lib/validations/auth-validation.ts`
(kept separate from `lib/db/schema/auth-schema/`, the actual DB tables, to
avoid the name collision — DB table exports keep their short names since
they're used constantly in queries, e.g. `manual` in `manual-schema.ts`;
validation exports get the fuller name, e.g. `signInValidationSchema`).

Route groups split the app by chrome:

- `app/(auth)/` — sign-in / sign-up / sign-in-with-code, no nav, just the form
- `app/(main)/` — everything else (home, category browsing, `/onboarding`,
  `/workspace/members`, `/invite/accept`), wrapped in a sidebar + header
  shell via `app/(main)/layout.tsx` — this replaced the old top-header
  `Navbar` entirely. `components/sidebar/app-sidebar.tsx` (a client
  component — see gotcha below) renders two groups: a "Workspace" group
  (hidden entirely when signed out) showing either "Create workspace" or
  the org name expanded (`defaultOpen`, so "Members" is visible without an
  extra click — this is the actual fix for "I can't find where to create a
  workspace"), and a "Browse" group that's **dual-mode**: if the active
  workspace has any categories seeded into the `category` table, those are
  fetched (`getCategoriesForActiveOrg` server action) and rendered
  reorderable (`SortableCategoryList`, dnd-kit — drag handle only, so it
  never conflicts with the click-to-expand row); otherwise it falls back to
  the static `CATEGORY_LIST` (signed out, or a real workspace nothing's
  been seeded into yet — there's still no "create category" UI). Either
  way each category renders through the same `CategoryNavItem`
  (icon/label/href/staticKey/dragHandle props — not tied to one data
  source) and expands to list that category's subpages, sortable A-Z or
  Newest, scrollable past a handful of items (an internal
  `max-h-64 overflow-y-auto`, not a whole-sidebar scroll — other
  categories/the workspace section stay in place), with a "View category
  page" link at the bottom. DB categories whose slug doesn't match one of
  the 5 static ones (a genuinely custom category) render with "Nothing
  here yet" instead of subpages — subpage content is still 100% the static
  `lib/data/*` files regardless of where the category itself came from.
  `components/sidebar/site-header.tsx` (black, lives inside `SidebarInset`
  so it can use `SidebarTrigger`) holds the brand, an always-visible inline
  search (no dialog/⌘K needed anymore), and the session-aware auth UI —
  sign-in/up buttons, or an avatar dropdown with just email + sign-out
  (workspace navigation lives in the sidebar now, not duplicated in the
  dropdown too). Auth lives in the header rather than the sidebar footer so
  it stays visible even when the sidebar is collapsed.
- root `app/layout.tsx` stays bare (fonts + `QueryProvider` only) so each
  group controls its own chrome

Gotchas hit while building this shell, all worth knowing about:

- `SidebarInset` (the shadcn primitive wrapping page content) has an
  opaque `bg-background` by default — every page under `(main)` that uses a
  full-viewport `fixed`/`-z-10` decorative background (`GitGraphBackground`,
  `ManualsBackground`, etc.) needs that overridden, which
  `app/(main)/layout.tsx` does with `<SidebarInset className="bg-transparent">`.
  If a new page's decorative background isn't showing, this is the first
  thing to check.
- Base UI's `Menu.GroupLabel` (what shadcn's `DropdownMenuLabel` wraps)
  throws at runtime ("MenuGroupContext is missing") unless it's inside a
  `DropdownMenuGroup` — unlike Radix, it can't stand alone directly inside
  `DropdownMenuContent`. See `sidebar-user.tsx` for the pattern.
- `lib/constants/categories.ts`'s `CategoryConfig` holds real function values
  (`icon: LucideIcon`, `Background: ComponentType`) — passing a whole
  `category` object as a *prop* from a Server Component into a Client
  Component throws ("Functions cannot be passed directly to Client
  Components"), since props crossing that boundary must be serializable.
  `AppSidebar` is `"use client"` specifically so it can pass icon
  components around without crossing that boundary at all. DB categories
  sidestep this at the schema level instead — `category.icon` is a plain
  string, resolved to an actual component client-side via
  `lib/icon-map.ts`'s `resolveIcon()`, which is why that file exists
  rather than just storing the component reference.
- `reorderCategoryAction` (in `lib/actions/category-actions.ts`) is the
  pattern for every future org-scoped write: verify the row actually
  belongs to `session.activeOrganizationId` in the `where` clause itself
  (`and(eq(category.id, id), eq(category.organizationId, orgId))`), not
  just in a comment — a first draft of this action had exactly that gap
  (checked in a comment, not in the query) before being caught and fixed.
- Better Auth has **no fallback** for an unset `session.activeOrganizationId`
  — `useActiveOrganization()` just returns nothing active, even for a user
  who belongs to exactly one workspace, and nothing sets it automatically
  on sign-in either. `lib/hooks/use-auto-active-organization.ts` fills that
  gap (auto-selects when there's exactly one membership) and is called
  from `AppSidebar`. Without it, every DB-backed feature that depends on an
  active org (categories, members, invites) silently falls back to the
  "nothing active" state for anyone who hasn't manually run
  `setActiveOrganization` — which is exactly what happened the first time
  a real (non-test) workspace was created directly in the database rather
  than through `authClient.organization.create` (that endpoint sets
  active-org as a side effect; a raw insert doesn't). This exact gap is
  also what broke sidebar drag-and-drop for the real Codestash workspace —
  fixed via `scripts/seed-codestash-owner-membership.ts`, which adds the
  missing membership through `auth.api.addMember` rather than a raw insert.

Also: `hooks/use-mobile.ts`'s `useIsMobile` used to read `window.innerWidth`
inside its `useState` initializer, which mismatches between server (no
`window`) and the client's pre-hydration render on any viewport under the
768px breakpoint — a real hydration error, not a hypothetical one. Fixed to
start `undefined` on both sides and sync the real value in a `useEffect`
after mount. If you add another viewport-dependent hook, this is the shape
to copy.

## Protected routes

Two layers, not one: `proxy.ts` (Next 16's renamed `middleware.ts`) does a
fast, cookie-presence-only redirect for unauthenticated hits — it's not the
real access-control boundary, since it can't verify the session is actually
still valid. The real check happens server-side in the page itself via
`auth.api.getSession({ headers: await headers() })`, which redirects if
there's no valid session — see `app/(main)/onboarding/page.tsx` for the
pattern. Add new protected paths to `proxy.ts`'s `config.matcher` AND repeat
the server-side check in the page — neither layer alone is sufficient.

`app/(main)/invite/accept/` is deliberately excluded from `proxy.ts` — it
needs to render for signed-out visitors so it can show its own "sign in to
accept" state, rather than being redirected before the page loads. Accepting
is enforced server-side by Better Auth itself: the session's email must
exactly match the invitation's email, or it returns 403
`YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION`.

## Where things stand

DB/auth: schema is pushed to Neon; sign-up and sign-in (password and
email-code) are working end-to-end against the real database, and so is
the full workspace flow — creating your first workspace (`/onboarding`,
you become `owner`), inviting people (`/workspace/members`, as `admin` or
`member`), and accepting an invite (`/invite/accept?id=...`). Social login
(Google, etc.) is intentionally parked until there's a step dedicated to
going and getting each provider's credentials. Note: being flagged as the
platform `superadmin` (not workspace `owner` — a separate, app-wide role)
is still a manual one-time step, not wired into any UI yet.

**As of 2026-09-03, the catalog is 100% DB-backed — no static content or
fallback remains anywhere.** `lib/data/` now holds only `types.ts` (shared
TypeScript types); the `manuals/`, `hooks/`, `helpers/`, `blocks/`, and
`ai-instructions/` folders that used to hold hardcoded content are
deleted. This closes the gap the paragraphs below used to describe (kept
here, updated, rather than deleted outright, since the "why" is still
useful history):

- Every read path — subpages, category listing pages, the homepage's
  category cards, sidebar categories, sidebar subitems, and sidebar
  search — resolves through `lib/actions/manual-actions.ts` and
  `lib/actions/category-actions.ts`, all DB-only now.
- The real blocker wasn't missing data, it was that every one of those
  reads required `session.activeOrganizationId` — so a signed-out visitor
  (i.e. the actual public site) never saw DB content no matter what was
  in it, and silently fell back to static files instead. Fixed by
  `lib/actions/public-organization.ts`'s `getPublicOrganizationId()`: any
  read with no active-org session now falls back to the one real
  ("codestash"-slug) organization instead of returning nothing. Writes
  (`reorderCategoryAction`, etc.) are untouched — still require a real
  session, so a signed-out visitor gets a read-only sidebar (no drag
  handle) even though the same DB rows power it.
- Snippets (hooks/helpers/blocks/AI instructions) don't have their own
  table — the old separate `snippet` table was retired in favor of
  storing a snippet as a `manual` row with exactly one section and a
  single `code` block (the degenerate one-node case of the same shape).
  `[category]/[subpage]/page.tsx`'s `toSnippet()` reshapes that DB row
  back into the flat `Snippet` shape `SnippetPage` expects. The physical
  `snippet` table itself (leftover after the code stopped referencing it)
  has since been dropped from Postgres too — nothing references it, code
  or schema.
- Categories are dynamic and reorderable for any workspace that has some
  seeded into the `category` table — verified live: seeded 3 test
  categories into a test workspace, dragged one to a new position with
  real mouse events, confirmed the new fractional rank persisted in Neon
  and survives a fresh page load. There's still no "create category" UI
  — the only way a workspace gets DB categories today is a manual seed
  (see `scripts/seed-codestash-category.ts`). The real workspace
  ("Codestash", under `heguer76@gmail.com`) has all 6 of its categories
  (the 5 built-in ones plus a custom `codestash` category holding this
  project's own planning docs as in-app manuals) seeded this way — 29
  manual rows total across them as of 2026-09-03. Icon picker (any
  lucide-react icon, not just `lib/icon-map.ts`'s small curated set) and
  background theme presets are still future work — every category besides
  the 5 built-in ones renders with a plain default look, no custom
  Background component, on purpose (see [[codestash_no_static_data_goal]]
  in Claude's memory / the equivalent decision recorded in
  `md-docs/ROADMAP.md`).
- Also added: `organization.plan` (defaults `"free"`) — groundwork for a
  future free-vs-paid category cap, not enforced anywhere yet, no billing
  wired up. See `md-docs/ROLES-AND-BILLING-PLAN.md` for the full design
  this is heading toward, and `md-docs/ROADMAP.md` for the build-out
  sequencing.

`mastering-git` (the one hand-authored manual, formerly
`lib/data/manuals/mastering-git.ts`, now DB-only) had picked up stray
content at some point — an inserted "Git Basics Recap" section and a
section literally titled "Format Test (fake data — nesting depth check)"
appended after it, neither of which exist on `main` or the deployed site.
Restored from `main` (2026-09-02), verified against the live site's
actual section list first, not assumed, before the static file itself was
deleted entirely in the migration above. If a manual's content ever looks
off again, there's no static file left to diff against — check the DB row
directly and cross-check the deployed site.

For the up-to-date step-by-step plan and what's done vs. still open, read
the "next16-neon-better-auth" manual in-app rather than this file — this
file only covers how to get the project running locally. Note: that
manual itself is currently DB-backed content for the signed-in Codestash
workspace, not a static file — it won't render for a signed-out visitor or
a different workspace, and the version on the deployed `main` branch is a
stale pre-DB-work snapshot.
