import type { Manual } from "../types";

export const next16NeonBetterAuth: Manual = {
  slug: "next16-neon-better-auth",
  title: "Next16 + Neon + Better Auth",
  subtitle:
    "Search or expand a section. Nested items (1.1, 1.2 ...) open inside their parent.",
  createdAt: "2026-09-01",
  sections: [
    // ============================================================
    // 1. WHERE WE STARTED — LOCAL, STATIC BOILERPLATE
    // ============================================================
    {
      id: "starting-point",
      number: "1",
      title: "Where We Started — Local, Static Boilerplate",
      blocks: [
        {
          type: "p",
          text: "Codestash began as a purely static Next.js app — no database, no auth, no users. Every category of content (manuals, hooks, helpers, blocks, AI instructions) is just TypeScript data, imported and rendered.",
        },
      ],
      children: [
        {
          id: "starting-data-layer",
          number: "1.1",
          title: "The data layer (lib/data)",
          blocks: [
            {
              type: "p",
              text: "Each category lives in its own folder under `lib/data/` (e.g. `lib/data/manuals/`). A shared `types.ts` defines the shapes — `Manual`, `ManualSection`, `ContentBlock` (p / list / code / note), and `Snippet` for the simpler categories (hooks, helpers, blocks, AI instructions).",
            },
            {
              type: "p",
              text: "Every manual is one file exporting a `Manual` object, plus an `index.ts` per category that imports each file and exports a flat array (`manuals`, `hooks`, etc.) along with a `getX(slug)` lookup helper.",
            },
            {
              type: "note",
              text: "`mastering-git.ts` is the one manual that's hand-authored content — the rest were AI-generated filler to have something to browse while the UI was being built.",
            },
          ],
        },
        {
          id: "starting-rendering",
          number: "1.2",
          title: "Rendering pipeline",
          blocks: [
            {
              type: "p",
              text: "Pages read directly from the static arrays at request time — no fetch, no loading state, since it's all bundled JS. `components/manuals/manual-accordion.tsx` recursively renders a `ManualSection[]` into nested shadcn Accordions, arbitrarily deep, with search filtering and a depth-based tint.",
            },
            {
              type: "p",
              text: "This is the baseline everything below builds on top of — until step 8, the public site keeps working exactly like this.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 2. MOVING INTO THE CLOUD (DONE — codestash-db BRANCH)
    // ============================================================
    {
      id: "cloud-foundations",
      number: "2",
      title: "Moving Into the Cloud (done — codestash-db branch)",
      blocks: [
        {
          type: "note",
          text: "Everything in this section is already scaffolded on the `codestash-db` branch, uncommitted, waiting on a real database connection to actually run against.",
        },
      ],
      children: [
        {
          id: "cloud-stack",
          number: "2.1",
          title: "The stack we chose",
          blocks: [
            {
              type: "list",
              items: [
                "Neon — serverless Postgres, generous free tier, DB branching that mirrors our git branching",
                "Drizzle ORM — lighter than Prisma, pairs naturally with Neon's HTTP driver",
                "Better Auth — auth library with an `organization` plugin (workspaces, roles, invites) and an `admin` plugin (platform-level super admin)",
                "Zod, React Hook Form, @hookform/resolvers — form validation for the admin panel",
                "TanStack React Query — mutation state + optimistic updates for drag-and-drop reordering",
                "shadcn (already in place), plus free third-party shadcn-compatible blocks where useful",
              ],
            },
          ],
        },
        {
          id: "cloud-installed",
          number: "2.2",
          title: "What got installed",
          blocks: [
            {
              type: "code",
              code: `npm install drizzle-orm @neondatabase/serverless better-auth zod react-hook-form @hookform/resolvers @tanstack/react-query
npm install -D drizzle-kit`,
            },
            {
              type: "p",
              text: "`@better-auth/cli` was installed temporarily to generate the auth schema (step 2.4), then removed — it's only needed again if the auth config changes and the schema needs regenerating.",
            },
          ],
        },
        {
          id: "cloud-auth-roles",
          number: "2.3",
          title: "Auth & roles (lib/auth.ts)",
          blocks: [
            {
              type: "p",
              text: "The four-tier role model we agreed on maps onto Better Auth's built-ins instead of hand-rolled tables:",
            },
            {
              type: "list",
              items: [
                "Super admin (you) — the `admin` plugin's platform-level role, aliased to `superadmin`",
                "Workspace owner (paying admin) — organization's built-in `owner` role",
                "Sub-admin (added by an owner) — organization's built-in `admin` role — nearly full rights, but can't delete the workspace or remove the owner, which is the library's default behavior and matches what we wanted",
                "Guest editor (non-paying, invited) — organization's built-in `member` role, restricted from inviting others",
              ],
            },
            {
              type: "note",
              text: "The 5-record edit cap for guest editors is NOT a Better Auth concept — roles gate actions, not per-user counts — so it's enforced separately in app logic (see 2.4's `memberEditQuota` table).",
            },
          ],
        },
        {
          id: "cloud-schema",
          number: "2.4",
          title: "Schema (lib/db/schema/)",
          blocks: [
            {
              type: "p",
              text: "`auth-schema.ts` is generated output — `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`. Never hand-edit it; regenerate it if `lib/auth.ts` changes.",
            },
            {
              type: "p",
              text: "`app-schema.ts` is ours: `manual` (org-scoped, `ownerId`, `visibility: private | shared` — the hybrid personal + shared library model), `section` (the content tree — `parentId` + a `rank` string for ordering, never a stored `2.3`-style number, so inserting or reordering never renumbers siblings), and `memberEditQuota` (the 5-record guest cap, kept as its own table so regenerating `auth-schema.ts` never touches it).",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 3. PROVISION THE REAL DATABASE (NEXT STEP)
    // ============================================================
    {
      id: "provision-db",
      number: "3",
      title: "Provision the Real Database (next step)",
      blocks: [
        {
          type: "p",
          text: "Nothing has connected to a real database yet — `.env.local` is empty. This is the first step that requires you specifically, since it means creating an account/project.",
        },
      ],
      children: [
        {
          id: "provision-neon-project",
          number: "3.1",
          title: "Create the Neon project",
          blocks: [
            {
              type: "p",
              text: "Sign up at neon.tech, create a project (one per environment, or one project with a `dev` branch — Neon branches a whole Postgres instance, not just a git-style diff). Grab the pooled connection string.",
            },
          ],
        },
        {
          id: "provision-env",
          number: "3.2",
          title: "Wire the connection string",
          blocks: [
            {
              type: "code",
              code: 'DATABASE_URL="postgresql://...neon.tech/..."',
            },
            {
              type: "p",
              text: "Drop that into `.env.local`. Both `lib/db/index.ts` and `drizzle.config.ts` already read `process.env.DATABASE_URL` and throw a clear error if it's missing.",
            },
          ],
        },
        {
          id: "provision-push",
          number: "3.3",
          title: "Push the schema",
          blocks: [
            {
              type: "code",
              code: "npx drizzle-kit push",
            },
            {
              type: "p",
              text: "Creates every table from `auth-schema.ts` + `app-schema.ts` directly on Neon. Fine while iterating solo; switch to `drizzle-kit generate` + versioned migration files once other people depend on the schema not shifting under them.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 4. AUTH UI & YOUR FIRST WORKSPACE
    // ============================================================
    {
      id: "auth-ui",
      number: "4",
      title: "Auth UI & Your First Workspace",
      children: [
        {
          id: "auth-ui-pages",
          number: "4.1",
          title: "Sign-in / sign-up pages",
          blocks: [
            {
              type: "p",
              text: "Build the actual forms against `lib/auth-client.ts`'s `signIn` / `signUp` / `useSession`. Zod + React Hook Form for validation, shadcn `form`/`input` components for the UI.",
            },
          ],
        },
        {
          id: "auth-ui-workspace",
          number: "4.2",
          title: "Creating a workspace",
          blocks: [
            {
              type: "p",
              text: "Your first sign-in creates your personal `organization` (the family/friends workspace) via `authClient.organization.create`. You become its `owner`. This is also where the platform `superadmin` role gets set on your user row — a one-time manual step or a seed script, not something exposed in the UI.",
            },
          ],
        },
        {
          id: "auth-ui-invites",
          number: "4.3",
          title: "Inviting people",
          blocks: [
            {
              type: "p",
              text: "`authClient.organization.inviteMember` with a role of `admin` (sub-admin) or `member` (guest editor). Per our decision, accepting an invite requires creating an account — no anonymous edit links — so invites can be tied to a person and the 5-record cap can actually be enforced.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 5. MIGRATE STATIC CONTENT INTO THE DB
    // ============================================================
    {
      id: "migrate-content",
      number: "5",
      title: "Migrate Static Content Into the DB",
      children: [
        {
          id: "migrate-seed-script",
          number: "5.1",
          title: "Write a one-time seed script",
          blocks: [
            {
              type: "p",
              text: "Walk `lib/data/manuals/index.ts`'s `manuals` array (and the other categories once they're modeled) and insert each `Manual` as a `manual` row plus a `section` row per `ManualSection`, recursing into `children` and computing a `rank` for each sibling as you go.",
            },
            {
              type: "p",
              text: "This script is the only place the dotted `number` field and the new `rank`/tree model ever have to talk to each other.",
            },
          ],
        },
        {
          id: "migrate-pilot",
          number: "5.2",
          title: "mastering-git.ts becomes the pilot",
          blocks: [
            {
              type: "p",
              text: "Since it's the one real, hand-authored manual, migrate it first and use it to sanity-check the whole pipeline (seed → render from DB → edit in admin panel → re-render) before migrating the AI-filler manuals.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 6. BUILD THE ADMIN PANEL
    // ============================================================
    {
      id: "admin-panel",
      number: "6",
      title: "Build the Admin Panel",
      children: [
        {
          id: "admin-editor",
          number: "6.1",
          title: "Structured block-form editor",
          blocks: [
            {
              type: "p",
              text: "One form component per `ContentBlock` type (`p`, `list`, `code`, `note`) — not a freeform markdown editor. Matches the existing typed-block schema exactly, so nothing about the public rendering (`manual-accordion.tsx`) has to change.",
            },
          ],
        },
        {
          id: "admin-tree",
          number: "6.2",
          title: "Section tree + drag-and-drop reorder",
          blocks: [
            {
              type: "p",
              text: "Drag-and-drop with indent/outdent, Notion-sidebar style — not typed-in position numbers. Each drop computes a new fractional `rank` between its new neighbors; the dotted display number (`2.3`, `2.3.1`) is always computed by walking the tree in rank order, never stored.",
            },
          ],
        },
        {
          id: "admin-actions",
          number: "6.3",
          title: "Server actions, not API routes",
          blocks: [
            {
              type: "p",
              text: "Every mutation here (create/edit/delete a section, reorder, create a manual) is a Next.js server action. The only real API route in the app is the Better Auth catch-all (`app/api/auth/[...all]/route.ts`) — that one has to be a route because Better Auth's client talks to it over HTTP directly.",
            },
            {
              type: "p",
              text: "Pair mutations with React Query (or `useOptimistic`) so drag-and-drop and edits feel instant.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 7. ENFORCE PERMISSIONS IN THE UI
    // ============================================================
    {
      id: "enforce-permissions",
      number: "7",
      title: "Enforce Permissions in the UI",
      children: [
        {
          id: "permissions-gated-actions",
          number: "7.1",
          title: "Role-gated actions",
          blocks: [
            {
              type: "p",
              text: "Hide/disable invite, add-sub-admin, and delete-workspace actions based on `authClient.organization.hasPermission` / the active member's role — checked server-side in the action too, never just in the UI.",
            },
          ],
        },
        {
          id: "permissions-guest-cap",
          number: "7.2",
          title: "The 5-record guest cap",
          blocks: [
            {
              type: "p",
              text: "Every section-editing server action checks `memberEditQuota.editCount < editLimit` for the acting member before writing, and increments it after. Scoped per-workspace, per our earlier decision — a guest invited into two different workspaces gets a fresh cap in each.",
            },
          ],
        },
        {
          id: "permissions-share-flow",
          number: "7.3",
          title: "Share-a-doc flow",
          blocks: [
            {
              type: "p",
              text: "\"Share this doc with someone\" is really just `createInvitation` scoped to intent (full workspace access vs. edit-this-doc-only needs its own lighter-weight invite type if we want true per-document sharing rather than per-workspace — worth a closer look once this is actually being built).",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 8. CUT THE PUBLIC SITE OVER TO THE DB
    // ============================================================
    {
      id: "cutover",
      number: "8",
      title: "Cut the Public Site Over to the DB",
      children: [
        {
          id: "cutover-server-components",
          number: "8.1",
          title: "Server Components read from Drizzle",
          blocks: [
            {
              type: "p",
              text: "Replace the static-array reads in the category/manual pages with Drizzle queries scoped to the viewer's accessible workspaces (their own + any `shared` manuals). Same URL structure, same components — `manual-accordion.tsx` doesn't care whether its data came from a `.ts` file or a query.",
            },
          ],
        },
        {
          id: "cutover-retire-static",
          number: "8.2",
          title: "Retire (or repurpose) lib/data",
          blocks: [
            {
              type: "p",
              text: "Once the DB is the source of truth, `lib/data/*` either gets deleted or kept around purely as the seed source for spinning up a fresh dev database.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 9. POLISH PASS
    // ============================================================
    {
      id: "polish",
      number: "9",
      title: "Polish Pass",
      blocks: [
        {
          type: "p",
          text: "You said this app has to be \"super super user friendly\" — this is where that actually gets tested, once real data and real people are in the loop.",
        },
      ],
      children: [
        {
          id: "polish-loading",
          number: "9.1",
          title: "Loading & empty states",
          blocks: [
            {
              type: "p",
              text: "Skeletons for the manual accordion while sections load, empty states for a brand-new workspace with no manuals yet.",
            },
          ],
        },
        {
          id: "polish-mobile",
          number: "9.2",
          title: "Mobile-friendliness",
          blocks: [
            {
              type: "p",
              text: "Family/friends will likely open this on a phone — the drag-and-drop reorder UX in particular needs a touch-friendly fallback (e.g. up/down move buttons alongside the drag handle).",
            },
          ],
        },
        {
          id: "polish-search",
          number: "9.3",
          title: "Search across real content",
          blocks: [
            {
              type: "p",
              text: "The current `sectionMatches` search walks an in-memory tree, which stops scaling once content is DB-backed and per-workspace. Postgres full-text search (or a `pg_trgm` index) is the natural next step — no need for a separate search service at this size.",
            },
          ],
        },
      ],
    },

    // ============================================================
    // 10. OPEN DECISIONS TO REVISIT
    // ============================================================
    {
      id: "open-decisions",
      number: "10",
      title: "Open Decisions to Revisit",
      blocks: [
        {
          type: "note",
          text: "Deliberately left unresolved rather than guessed at — revisit each when it actually becomes relevant, not before.",
        },
      ],
      children: [
        {
          id: "open-file-storage",
          number: "10.1",
          title: "Doc / file storage",
          blocks: [
            {
              type: "p",
              text: "Still unclear whether \"docs\" means file attachments (PDFs, images) or just more manual pages (which need no storage at all — just DB rows). If real file uploads turn out to be needed, ImageKit is image-specific; UploadThing or plain S3/R2 fit generic files better.",
            },
          ],
        },
        {
          id: "open-monetization",
          number: "10.2",
          title: "Monetization, if this becomes a product",
          blocks: [
            {
              type: "p",
              text: "The multi-tenant schema (step 2.4) is already designed to support this later, but billing (Stripe, plan limits) is intentionally out of scope until there's real demand to sell it.",
            },
          ],
        },
        {
          id: "open-deployment",
          number: "10.3",
          title: "Deployment & backups",
          blocks: [
            {
              type: "p",
              text: "Vercel is the natural pairing for Next.js + Neon. Worth confirming Neon's backup/point-in-time-recovery plan before family data lives there for real.",
            },
          ],
        },
      ],
    },
  ],
};
