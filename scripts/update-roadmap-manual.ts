// Keeps the in-app "Roadmap to Success" manual (seeded by
// seed-roadmap-manual.ts) in sync with md-docs/ROADMAP.md + md-docs/roadmap/*.md.
// Unlike the seed script, this one replaces the existing section tree rather
// than no-op'ing when the manual already exists — re-run it whenever the
// md-docs roadmap files change.
// Run with: npx tsx --env-file=.env.local scripts/update-roadmap-manual.ts

import { eq, and } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { db } from "../lib/db";
import { organization, member } from "../lib/db/schema/auth-schema";
import { manual, section } from "../lib/db/schema/app-schema";
import type { ContentBlock } from "../lib/data/types";

type Node = {
  title: string;
  blocks?: ContentBlock[];
  children?: Node[];
};

function phase(
  title: string,
  dek: string,
  locked: string[],
  checklist: string[],
  deferred: string,
  exit: string,
): Node {
  return {
    title,
    blocks: [
      { type: "p", text: dek },
      { type: "p", text: "**Locked decisions**" },
      { type: "list", items: locked },
      { type: "p", text: "**Checklist**" },
      { type: "list", items: checklist },
      { type: "note", text: `Deferred, on purpose: ${deferred}` },
      { type: "p", text: `**Exit condition:** ${exit}` },
    ],
  };
}

const roadmapSlug = "roadmap";
const roadmapTitle = "Roadmap to Success";
const roadmapSubtitle =
  "The plan to take Codestash from where it is to a real, paying-customer product.";

const sections: Node[] = [
  {
    title: "The Honest Current State",
    blocks: [
      { type: "p", text: "Not the optimistic version. Last updated 2026-09-03." },
      {
        type: "list",
        items: [
          "A real DB/auth layer — sign-up, sign-in, workspaces, invites, all working end-to-end. **The catalog itself is 100% DB-backed now, with zero static content or fallback left anywhere** (`lib/data/` holds only shared types) — every read, including for a signed-out visitor, goes through the DB via a public-org fallback (`getPublicOrganizationId()`) so the catalog was never gated behind having a session.",
          "**Exactly one real organization exists**, created by a direct database insert — no repeatable path exists yet for a second one.",
          "**Production was live but broken, now fixed** — `/` and every `/api/auth/*` call were 500ing because `NEXT_PUBLIC_APP_URL` in Vercel's Production env vars was missing its `https://` scheme (better-auth's `new URL(baseURL)` threw on every request touching `lib/auth.ts`). Corrected and confirmed returning 200, 2026-09-03.",
          "**CI now runs on every push** (`.github/workflows/ci.yml` — lint, `tsc --noEmit`, build) — added 2026-09-03. Still zero automated test suite; that's Phase 6, not this. The build step needs `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` added as GitHub Actions repo secrets before it can actually pass — not yet confirmed done.",
          "**Zero billing** — nothing charges anyone anything today.",
          "The roles/plan model's shape is decided on paper — Plan B/C's numbers and the 2 non-owner role levels are still TBD — and **zero of it is enforced in code** either way, beyond better-auth's built-in defaults.",
          'No "create category" UI, and no create/edit UI for manuals or snippets, for any role.',
        ],
      },
    ],
  },
  {
    title: "Principles — Corrections, Not Just a Continuation",
    blocks: [
      {
        type: "p",
        text: "Named specifically so they don't repeat under a new coat of paint. Each phase's locked decisions trace back to one of these.",
      },
    ],
    children: [
      {
        title: "1. Stop creating state by hand",
        blocks: [
          {
            type: "p",
            text: "The org, its categories, and (until recently) its owner membership were all created by direct inserts or one-off scripts — that exact pattern broke sidebar drag-and-drop. Nothing gets created except through the app's real flow, including in development.",
          },
        ],
      },
      {
        title: "2. Build the permission/plan-limit layer before more features",
        blocks: [
          {
            type: "p",
            text: "Every feature shipped so far went in with no thought to who's allowed to do it — backwards for a product whose business model is tiered, paid plans.",
          },
        ],
      },
      {
        title: "3. Billing earlier than feels comfortable",
        blocks: [
          {
            type: "p",
            text: '"Paying creates an organization" is the foundation the whole design sits on. An ugly, working checkout beats a beautiful app with no way to charge anyone.',
          },
        ],
      },
      {
        title: "4. Fix what's live before designing what's next",
        blocks: [
          {
            type: "p",
            text: "An unresolved production outage sat underneath this entire plan — Phase 0 existed because of it, and is now resolved.",
          },
        ],
      },
      {
        title: "5. Bring in a safety net exactly when the stakes go up",
        blocks: [
          {
            type: "p",
            text: "No tests, no CI is fine for a personal tool. It stops being fine once plans, seats, and permissions gate what real people can do and pay for.",
          },
        ],
      },
    ],
  },
  {
    title: "The Phases",
    blocks: [
      {
        type: "p",
        text: "Each phase has a concrete exit condition — a way to know it's actually done, not just worked on.",
      },
    ],
    children: [
      phase(
        "Phase 0 — Stabilize (checklist done, pending CI secrets)",
        "Fix what's actually live before doing anything else. No architecture work starts until production is honest again.",
        [
          "CI runs on every push to any branch, not just PRs into `main`.",
          "CI is GitHub Actions — already hosting the repo, no new tool to adopt.",
          "The 500 gets root-caused from the actual Vercel runtime log, not guessed at from client-side symptoms.",
        ],
        [
          "✓ Done — Pulled the real Vercel runtime log for a failing `/api/auth/get-session` request",
          "✓ Done — Root cause: `NEXT_PUBLIC_APP_URL` was missing its `https://` scheme, so better-auth's `new URL(baseURL)` threw on every request",
          "✓ Done — Fixed the env var and confirmed `/` and every `/api/auth/*` route returns 200 in production",
          "✓ Done — Added `.github/workflows/ci.yml` running lint, `tsc --noEmit`, and build on every push",
          "✓ Done — Committed `.env.example`",
          "Still open — add `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` as GitHub Actions repo secrets so the CI build step can actually pass",
        ],
        "Full test suite and error monitoring — both explicitly Phase 6.",
        "Production serves every route without a 500 (true as of 2026-09-03) and a broken build can't merge silently (true once CI secrets are added and a run goes green).",
      ),
      phase(
        "Phase 1 — Foundations",
        "The architecture layer. Nothing in Phase 2 onward gets built until this exists.",
        [
          "Plan limits live in one config file (`lib/config/plan-limits.ts`) — every plan-gated feature reads from it, never hardcodes a limit inline.",
          "Permission checks go through one reusable helper (`requireOrgRole()`), called at the top of every org-scoped server action.",
          "Category creation gets a real path — a form + server action. Manual DB seeding is retired for good.",
          '**Confirm before building:** resolving the "2 TBD role levels" by reusing better-auth\'s `owner`/`admin`/`member` — Organization Manager = `owner`.',
          "A seat = any active member including the owner — the owner occupies seat 1.",
          "`organization:delete` is removed from the `owner` role and reserved for the platform superadmin — implements the rule already locked in the roles/billing doc.",
        ],
        [
          "Lock Plan B/C's actual seat-pricing numbers — currently TBD",
          "Create `lib/config/plan-limits.ts` for plans A/B/C",
          "Build `getSeatUsage(orgId)`, owner included",
          "Enforce the seat cap in the invite flow",
          "Build `requireOrgRole()` helper",
          "Retrofit `reorderCategoryAction` to call it",
          "Override better-auth's org access control to remove `organization:delete` from `owner`",
          "Build `createCategoryAction` + a minimal add-category form",
        ],
        "Icon picker / background theme UI polish — Phase 3. Billing itself — Phase 2.",
        "No org, category, or membership row for any future workspace is ever created outside the app's own code paths.",
      ),
      phase(
        "Phase 2 — Billing",
        "The foundation the whole roles/plan design sits on. Nothing here is optional if this is meant to be a real product.",
        [
          "**Confirm before building:** processor is Stripe — most mature Next.js ecosystem support, native per-seat pricing.",
          "Stripe Checkout (hosted), not a custom payment form.",
          "Stripe subscriptions with quantity = seat count, mapped onto the per-seat curves in the roles/billing doc.",
          "`organization.plan` becomes the live trigger for Phase 1's plan-limits config, updated by webhook.",
          "A downgrade that would put the org over the new plan's seat limit gets blocked, not auto-applied.",
        ],
        [
          "Create Stripe account, get test-mode API keys",
          "Add Stripe env vars to `.env.example`, `.env.local`, Vercel",
          "Define 3 Stripe Products (A/B/C) with tiered/graduated seat pricing",
          "Rebuild `/onboarding`: name → pick plan → Stripe Checkout",
          "Build the webhook handler for checkout completed / subscription updated / cancelled",
          "Handle a failed payment with at minimum a visible banner/lock state",
        ],
        "Annual billing, coupons/discounts, proration math beyond Stripe's own handling, manual/enterprise invoicing.",
        "A second real, paying organization can come into existence without a developer touching the database.",
      ),
      phase(
        "Phase 3 — Core Product Completeness (partly done ahead of schedule)",
        "No create/edit UI for manuals or snippets exists for any role today. (The other original gap — public pages ignoring the database — is already closed as of 2026-09-03, see below.)",
        [
          "One shared editor for manuals and snippets — they already share the same table shape.",
          "✓ Done, and taken further than planned — public pages switched from \"static unconditionally\" to fully DB-only, no fallback left at all, not just \"DB first, static fallback.\"",
          "Delete is soft (a status field), not a row removal.",
        ],
        [
          "Build the manual/snippet create form",
          "Build edit — same form, pre-filled",
          "Build soft-delete",
          "✓ Done — Update `/` and `/[category]` to query DB content — no static fallback left anywhere",
          "Icon picker — any lucide-react icon",
          "Background theme presets — a small fixed set",
        ],
        "Rich text/WYSIWYG editing — start with plain textarea + markdown. Custom background image uploads — presets only for now.",
        "A workspace's content is fully self-service — no static file or seed script needed for real content.",
      ),
      phase(
        "Phase 4 — Team Features",
        "Makes the role model from Phase 1 mean something day-to-day, not just at invite/delete-org time.",
        [
          "Member-edit-quota enforcement happens in the same create/edit actions from Phase 3.",
          "Seat management UI extends `/workspace/members` (already exists), no new page.",
        ],
        [
          "Wire `memberEditQuota` reads/writes into the Phase 3 editor actions",
          "Add a remaining-quota indicator in the editor UI",
          "Extend `/workspace/members` with seat count vs. limit, and remove-member",
          "Confirm the Phase 1 role mapping is fully enforced here",
        ],
        "Per-member custom permission overrides beyond the 3 fixed levels — intentionally not planned.",
        "A member's capabilities are governed by their role, not just whether they're in the org.",
      ),
      phase(
        "Phase 5 — Polish, the Original UX Work",
        "The sidebar drag-and-drop/scroll work that started this whole conversation, revisited with real architecture underneath.",
        [
          "This phase is UX-only. No new data model or permission changes — a deliberate guardrail against scope creep.",
        ],
        [
          "Revisit sidebar category UX with real category creation in place",
          "General visual pass — spacing, empty states, loading states",
          "Mobile responsiveness pass",
        ],
        'Nothing new gets added in this phase — it\'s "make what exists good," not "add more."',
        "The UX work that started this whole conversation, done with the architecture actually supporting it.",
      ),
      phase(
        "Phase 6 — Scale Readiness",
        "Coverage grows exactly where the stakes are highest — money and access control.",
        [
          "**Confirm before building:** test framework is Vitest — fast, clean Next.js/TypeScript fit.",
          "Test scope stays narrow at first: the permission helper, plan-limit checks, seat-cap checks, the Stripe webhook handler.",
          "Error monitoring: Sentry (or equivalent).",
        ],
        [
          "Add Vitest, test `requireOrgRole`",
          "Test plan-limit and seat-cap enforcement",
          "Test the Stripe webhook handler (mocked events)",
          "Wire up Sentry for client and server error capture",
          "Re-verify the infra-swap boundary holds",
        ],
        "Full end-to-end test suite, load testing.",
        'Ready to hold up under real, paying usage — not just "it worked when I tried it."',
      ),
    ],
  },
  {
    title: "Infra Independence",
    blocks: [
      {
        type: "p",
        text: "None of the above depends on staying on Neon or Vercel. The org/role/plan model, the permission-check pattern, and the billing hook points are the same regardless of what's underneath. The one discipline required: keep database access behind **lib/db** and **lib/actions**, and auth behind **lib/auth** — so a future move (Neon → Appwrite, Vercel → Cloudflare) only touches those adapter layers, never the business logic on top.",
      },
    ],
  },
];

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) {
    throw new Error('No organization named "Codestash" found.');
  }

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
  });
  if (!owner) {
    throw new Error(`No owner member found for organization ${org.id}.`);
  }

  const existing = await db.query.manual.findFirst({
    where: and(eq(manual.organizationId, org.id), eq(manual.slug, roadmapSlug)),
  });

  let manualId: string;
  if (existing) {
    manualId = existing.id;
    await db.delete(section).where(eq(section.manualId, manualId));
    await db
      .update(manual)
      .set({ title: roadmapTitle, subtitle: roadmapSubtitle })
      .where(eq(manual.id, manualId));
    console.log(`Clearing and refreshing existing manual "${roadmapSlug}" (${manualId}).`);
  } else {
    const categoryRow = await db.query.category.findFirst({
      where: (c, { eq: eq2, and: and2 }) =>
        and2(eq2(c.organizationId, org.id), eq2(c.slug, "manuals")),
    });
    if (!categoryRow) {
      throw new Error('No "manuals" category found for this org yet.');
    }
    manualId = crypto.randomUUID();
    await db.insert(manual).values({
      id: manualId,
      organizationId: org.id,
      categoryId: categoryRow.id,
      ownerId: owner.userId,
      slug: roadmapSlug,
      title: roadmapTitle,
      subtitle: roadmapSubtitle,
    });
    console.log(`Created new manual "${roadmapSlug}" (${manualId}).`);
  }

  let count = 0;
  async function insertLevel(nodes: Node[], parentId: string | null) {
    let prevRank: string | null = null;
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
      const inserted = await db.query.section.findFirst({
        where: and(eq(section.manualId, manualId), eq(section.rank, rank)),
      });
      if (node.children?.length && inserted) {
        await insertLevel(node.children, inserted.id);
      }
    }
  }

  await insertLevel(sections, null);

  console.log(`Refreshed manual "${roadmapSlug}" (${manualId}) with ${count} sections.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
