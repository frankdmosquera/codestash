// One-time: seeds STORY.md, SETUP.md, and ROLES-AND-BILLING-PLAN.md as
// three more manuals under "manuals", completing the doc-family-as-in-app
// idea started by scripts/seed-roadmap-manual.ts (which only did
// ROADMAP.md). Same org/category/owner preconditions, same insert-only
// approach.
// Run with: npx tsx --env-file=.env.local scripts/seed-doc-family-manuals.ts
//
// Safe to re-run: skips any manual slug that already exists for the org.

import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { category, manual, section } from "../lib/db/schema/app-schema";
import type { ContentBlock } from "../lib/data/types";

type Node = {
  title: string;
  blocks?: ContentBlock[];
  children?: Node[];
};

type DocManual = {
  slug: string;
  title: string;
  subtitle: string;
  sections: Node[];
};

const docs: DocManual[] = [
  {
    slug: "story",
    title: "The Story",
    subtitle: "How Codestash actually came to be, told as it happened.",
    sections: [
      {
        title: "Part One: How It's Born",
        blocks: [
          {
            type: "p",
            text: "It didn't start as an app idea. It started as annoyance: having to remember (or look up) Git/GitHub terminal commands every time, when it's really just a handful of words you'd rather copy-paste than memorize. That need — a fast place to grab the command you needed — came first.",
          },
          {
            type: "p",
            text: 'From there, the idea generalized: it\'s not just Git commands you want quick access to, it\'s any small thing — a code snippet, a hook, a helper you wrote once and now can\'t find. So the scope widened from "my Git cheat sheet" to "anywhere I stash reusable code" — which is where the name came from: **Codestash**.',
          },
          {
            type: "p",
            text: "The first real shape of it was small on purpose: a single self-contained HTML file, inline styles and JS, no build step — with an accordion so you could expand just the snippet you needed and ignore the rest. Fast, disposable, zero setup.",
          },
          {
            type: "p",
            text: "Today it's grown past that into an actual web app — Next.js, a real database, accounts, workspaces.",
          },
          {
            type: "note",
            text: 'The arc: annoyance with Git commands → generalized into "a stash for any snippet" → a quick single-file HTML doc → a full web app.',
          },
        ],
      },
      {
        title: "Part Two: Where the Redesign Came From",
        blocks: [
          {
            type: "p",
            text: "It started as UI work — the sidebar category buttons needed drag-and-drop, and a scrollbar for when a category had too many sub-items to fit. Small, contained fixes.",
          },
          {
            type: "p",
            text: 'But working through those UI questions kept surfacing something underneath: the problem wasn\'t really the buttons. Who could drag, who could invite, how many categories a workspace could have, what a "member" versus an "owner" was even allowed to do — none of that was actually decided anywhere. The UI kept asking questions the architecture didn\'t have answers for yet.',
          },
          {
            type: "p",
            text: 'That\'s the moment it turned from "fix the sidebar" into "we need to redesign this." The goal for the redesign: good user experience, first and foremost — and getting there means going back and rethinking the architecture underneath it, not just patching the UI on top of what\'s already there.',
          },
          {
            type: "note",
            text: "More parts to come as the redesign itself takes shape — the actual architectural plan lives in the Roadmap manual, not here.",
          },
        ],
      },
    ],
  },
  {
    slug: "setup",
    title: "Project Setup & Context",
    subtitle:
      "The practical get-it-running guide, plus where things actually stand today.",
    sections: [
      {
        title: "Prerequisites",
        blocks: [
          {
            type: "list",
            items: [
              "Node.js + npm",
              "A Neon account (free tier is fine) once you get to the database steps — not needed just to browse the static catalog.",
            ],
          },
        ],
      },
      {
        title: "Install",
        blocks: [{ type: "code", code: "npm install" }],
      },
      {
        title: "Run the Dev Server (Static Catalog Only)",
        blocks: [
          { type: "code", code: "npm run dev" },
          {
            type: "p",
            text: "Visit `/` to browse categories, or any manual directly, e.g. `/manuals/mastering-git`. Works with zero setup — the catalog can read straight from static files, no database required.",
          },
        ],
      },
      {
        title: "Database Setup (Neon + Drizzle)",
        blocks: [
          {
            type: "list",
            items: [
              "Create a Neon project and grab the **pooled** connection string.",
              'Add it to `.env.local` as `DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"`.',
              "Push the schema: `npx drizzle-kit push` (creates every table from `lib/db/schema/auth-schema/` and `lib/db/schema/app-schema/`).",
            ],
          },
          {
            type: "note",
            text: "Use `npx drizzle-kit generate` + versioned migrations instead once more than one person depends on the schema not shifting underneath them.",
          },
        ],
      },
      {
        title: "Auth (Better Auth)",
        blocks: [
          {
            type: "p",
            text: "`lib/auth.ts` configures Better Auth with the `admin` plugin (platform-level superadmin), `organization` plugin (workspaces — owner/admin/member roles, plus invites), and `emailOTP` plugin (6-digit email sign-in). `sendVerificationOTP` and `sendInvitationEmail` currently only log to the server console — no real email provider wired up yet. The route handler lives at `app/api/auth/[...all]/route.ts` — the one real API route in the app; every other mutation goes through server actions.",
          },
        ],
        children: [
          {
            title: "Route Groups",
            blocks: [
              {
                type: "list",
                items: [
                  "`app/(auth)/` — sign-in / sign-up / sign-in-with-code, no nav, just the form.",
                  "`app/(main)/` — everything else (home, category browsing, `/onboarding`, `/workspace/members`, `/invite/accept`), wrapped in a sidebar + header shell.",
                  "`components/sidebar/app-sidebar.tsx` renders a Workspace group (hidden when signed out) and a **dual-mode** Browse group: DB categories + `SortableCategoryList` (dnd-kit) when the workspace has any, else the static `CATEGORY_LIST` fallback.",
                  "Root `app/layout.tsx` stays bare (fonts + `QueryProvider` only) so each group controls its own chrome.",
                ],
              },
            ],
          },
          {
            title: "Gotchas",
            blocks: [
              {
                type: "list",
                items: [
                  "`SidebarInset` has an opaque `bg-background` by default — pages with a full-viewport decorative background need `className=\"bg-transparent\"` on it.",
                  "Base UI's `Menu.GroupLabel` throws unless it's inside a `DropdownMenuGroup` — unlike Radix, can't stand alone.",
                  "`CategoryConfig` holds real function values (icon/Background components) — can't cross the Server→Client Component boundary as a prop. DB categories sidestep this: `category.icon` is a plain string resolved via `resolveIcon()`.",
                  "`reorderCategoryAction` is the pattern for every org-scoped write: verify the row belongs to `session.activeOrganizationId` **in the query itself**, not just a comment.",
                  "Better Auth has no fallback for an unset `session.activeOrganizationId` — `use-auto-active-organization.ts` fills that gap. Without it, a workspace created by raw DB insert (skipping `authClient.organization.create`) never gets an active org for anyone — exactly what broke sidebar drag-and-drop, fixed via `scripts/seed-codestash-owner-membership.ts`.",
                  "`useIsMobile` must start `undefined` on both server and client and sync the real value in a `useEffect` — reading `window.innerWidth` in the `useState` initializer causes a real hydration error.",
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Protected Routes",
        blocks: [
          {
            type: "p",
            text: "Two layers, not one: `proxy.ts` does a fast, cookie-presence-only redirect — not the real access-control boundary, since it can't verify the session is still valid. The real check happens server-side in the page via `auth.api.getSession()`. Add new protected paths to both `proxy.ts`'s `config.matcher` **and** the server-side check — neither alone is sufficient.",
          },
          {
            type: "note",
            text: "`/invite/accept/` is deliberately excluded from `proxy.ts` — it needs to render for signed-out visitors so it can show its own \"sign in to accept\" state.",
          },
        ],
      },
      {
        title: "Where Things Stand",
        blocks: [
          {
            type: "p",
            text: "Static catalog: fully working, no DB needed. DB/auth: schema pushed to Neon; sign-up/sign-in, workspace creation, invites, and accepting an invite all work end-to-end. Platform superadmin status is still a manual, one-time, no-UI step.",
          },
          {
            type: "p",
            text: 'Categories are dynamic and reorderable for any workspace with categories seeded in the DB — but there\'s still no "create category" UI, so manual seeding is the only path today. The homepage and public category pages still read the static catalog unconditionally; only the signed-in sidebar is DB-aware so far.',
          },
          {
            type: "p",
            text: "Snippets no longer have their own table — retired in favor of storing a snippet as a `manual` row with one section and a single code block. Public `/[category]` pages and sidebar subitems still resolve snippets from static files, though.",
          },
          {
            type: "note",
            text: "See the Roadmap manual for what's next, and the Roles & Billing Plan manual for the design being built toward.",
          },
        ],
      },
    ],
  },
  {
    slug: "roles-and-billing-plan",
    title: "Organizations, Roles & Billing Plan",
    subtitle:
      "Agreed direction for paid organizations, seats, roles, and plan tiers — not yet built.",
    sections: [
      {
        title: "Where the Code Stands Today",
        blocks: [
          {
            type: "list",
            items: [
              "The public catalog works with zero setup — no login, no database.",
              "Sign-up, sign-in, and the workspace flow already work end-to-end: creating a workspace makes you its `owner`, invite people as `admin` or `member`, they can accept.",
              'Exactly **one** real organization exists — "Codestash" — created by a direct database insert, not the normal signup flow. That bypass is what caused the earlier sidebar drag-and-drop bug.',
              'Categories can be dragged/reordered for a workspace with seeded categories — but there\'s still no "create category" UI.',
              'An `organization.plan` field exists, defaulting to `"free"` — groundwork for this plan, but nothing reads it yet.',
              "Platform superadmin status is a manual, one-time, no-UI step today.",
            ],
          },
        ],
      },
      {
        title: "The Plan",
        blocks: [
          {
            type: "p",
            text: "Five decisions, in order of how they build on each other.",
          },
        ],
        children: [
          {
            title: "1. Platform Superadmin",
            blocks: [
              {
                type: "p",
                text: "One role above every organization, already wired via better-auth's `admin` plugin. **New rule:** only a superadmin can delete an organization — not even an org's own owner can. This changes better-auth's default, where an owner can delete their own org.",
              },
            ],
          },
          {
            title: "2. Organization = Paying Customer",
            blocks: [
              {
                type: "p",
                text: "Paying is the event that creates an organization. The first payer becomes that org's owner/manager.",
              },
            ],
          },
          {
            title: "3. Org Plan (Dial A) — Three Plans, Priced Per Seat",
            blocks: [
              {
                type: "p",
                text: "Three plans: **A** (premium, most features), **B** (middle), **C** (cheapest, fewest features). Each scales with seat count rather than a flat price.",
              },
              {
                type: "list",
                items: [
                  "Plan A, 1 seat: $10",
                  "Plan A, 2 seats: $18",
                  "Plan A, 3 seats: $25",
                  "Plan A, 4th seat and beyond: +$7 each",
                ],
              },
              {
                type: "note",
                text: "Plan C follows the same shaped curve, cheaper throughout. Exact numbers for B and C are still TBD. Controls whole-org feature ceilings — categories, custom backgrounds/icons, invite count; the exact feature-to-plan mapping is still open.",
              },
            ],
          },
          {
            title: "4. Org Role (Dial B) — Separate from the Plan, 3 Levels",
            blocks: [
              {
                type: "p",
                text: "Independent of plan/seat count. **Organization Manager** at the top (the owner — full oversight), then 2 more levels underneath — not defined yet, placeholders for now. Governs what one person can personally do inside an org.",
              },
            ],
          },
          {
            title: "5. Free / No-Org Users",
            blocks: [
              {
                type: "p",
                text: 'An invited person isn\'t really "in" until they sign up through the invite link and create an account. Someone who never pays and is never invited never gets an organization at all.',
              },
            ],
          },
        ],
      },
      {
        title: "What's Missing to Make This Plan Real",
        blocks: [
          {
            type: "list",
            items: [
              "**An actual payment processor** — nothing charges anyone anything today.",
              "**A single source of truth for what each plan includes** — the `plan` field exists but nothing checks it.",
              "**Seat counting and enforcement** — nothing compares actual member count against what an org is paying for.",
              "**Actual permission checks for the org roles** — only better-auth's built-in ones exist; nothing in this app's own code checks role for anything.",
              'The "create a workspace" flow needs to change shape — from typing a name to picking a plan and paying for it.',
            ],
          },
        ],
      },
    ],
  },
];

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) throw new Error('No organization named "Codestash" found.');

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
  });
  if (!owner) throw new Error(`No owner member found for organization ${org.id}.`);

  const categoryRow = await db.query.category.findFirst({
    where: and(eq(category.organizationId, org.id), eq(category.slug, "manuals")),
  });
  if (!categoryRow) throw new Error('No "manuals" category found for this org yet.');

  async function insertLevel(manualId: string, nodes: Node[], parentId: string | null) {
    let prevRank: string | null = null;
    let count = 0;
    for (const node of nodes) {
      const rank = generateKeyBetween(prevRank, null);
      prevRank = rank;
      await db.insert(section).values({
        id: crypto.randomUUID(),
        manualId,
        parentId,
        rank,
        title: node.title,
        blocks: node.blocks ?? [],
      });
      count++;
      if (node.children?.length) {
        const inserted = await db.query.section.findFirst({
          where: and(eq(section.manualId, manualId), eq(section.rank, rank)),
        });
        if (inserted) count += await insertLevel(manualId, node.children, inserted.id);
      }
    }
    return count;
  }

  for (const doc of docs) {
    const existing = await db.query.manual.findFirst({
      where: and(eq(manual.organizationId, org.id), eq(manual.slug, doc.slug)),
    });
    if (existing) {
      console.log(`Manual "${doc.slug}" already exists — skipping.`);
      continue;
    }

    const manualId = crypto.randomUUID();
    await db.insert(manual).values({
      id: manualId,
      organizationId: org.id,
      categoryId: categoryRow.id,
      ownerId: owner.userId,
      slug: doc.slug,
      title: doc.title,
      subtitle: doc.subtitle,
    });

    const count = await insertLevel(manualId, doc.sections, null);
    console.log(`Seeded manual "${doc.slug}" (${manualId}) with ${count} sections.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
