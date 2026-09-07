# AI Blueprint: One Command, Two Stacks

## Overview

This is the process for starting any new project with
[ai-blueprint.dev](https://ai-blueprint.dev/)'s Blueprint workflow system,
using Frank's own installer instead of the public `npx create-ai-blueprint`
package directly. One command creates the folder, scaffolds the chosen
stack, and overlays the Blueprint workflow files — all pre-tuned, no
`npx` install step needed at all.

## The two tool folders

- **`blueprint-franks-style/`** — the installer engine. Only needed for the
  one-command automated path below. It runs `create-next-app`, builds the
  Hono/shared workspace for the Railway stack, and drives the whole process.
- **`claude-md-starter/`** — the actual payload: a ready-made copy of the
  Blueprint workflow files (`.claude/skills/`, `AGENTS.md`, `CLAUDE.md`,
  `blueprint/`), already tuned (real `config.json` preset, and a working
  `complete` skill that still writes the paired walkthrough PDF, restored
  after the public package dropped that feature in a later version). The
  installer copies this in automatically; it can also be copied in by hand
  for a stack outside the two presets below.

## Step 1: Run the installer

Open a terminal wherever new projects live (not inside `blueprint-franks-style`
itself — the new folder is created relative to wherever the command runs
from):

```
node C:\Users\frank\Desktop\coding\ai\blueprint-franks-style\install.mjs my-new-app
```

This creates `my-new-app\` itself — no empty folder to make by hand first.

## Step 2: Pick a stack

It asks right there in the terminal:

```
Which stack?
  1) Next.js only
  2) Next.js + Railway (Hono backend monorepo)
```

- **Next.js only** — for apps or services where Next.js alone is enough.
  Runs the real `create-next-app` once, right there in the new folder.
- **Next.js + Railway** — for a full app with a separate backend. Scaffolds
  `frontend/` (Next.js), `backend/` (a working Hono API), and
  `packages/shared/` (code shared between them) as one npm workspace, then
  installs everything.

Today there are two combos. The same initial-choice pattern is meant to
extend to more later without changing anything about the steps around it.

## Step 3: It overlays Blueprint automatically

No `npx create-ai-blueprint` call happens at all — the installer copies
`claude-md-starter`'s contents on top of the freshly scaffolded app: every
skill (`/onboard`, `/feature`, `/implement`, `/complete`, and the rest),
`AGENTS.md`, `CLAUDE.md`, and `blueprint/` (blank `project-plan.md` +
`build-plan.md`, the tuned `config.json`, empty history folders).

It finishes with:

```
Done. cd into "my-new-app", open Claude Code, run /onboard.
```

## Step 4: Open Claude Code, run /onboard

```
cd my-new-app
claude
```

Then inside Claude Code: `/onboard`. It looks at what actually got
scaffolded, tunes `AGENTS.md`'s Commands section and `coding-standards.md`
to match, and asks whether the Blueprint workflow files should be committed
with the repo or kept local-only.

## Step 5: Fill in the two plans

- `blueprint/project-plan.md` — the real one: problem, users, features,
  data, tech, monetize, UI/UX, deployment.
- `blueprint/build-plan.md` — the checklist of features, in build order.

Write these directly, talk them through with Claude, or run `/discovery`
for a guided conversation.

## Step 6: Run /overview

Turns the two plans into `blueprint/context/project-overview.md` — the
project's source of truth from then on.

## Step 7: The feature loop (same for every stack)

| Step | Command | What it does |
|---|---|---|
| Spec it | `/feature` (or `/fix` for a bug) | Writes `blueprint/context/current-feature.md` |
| Build it | `/implement` | Builds one small step at a time |
| Close it out | `/complete` | Archives the spec, writes the walkthrough PDF, commits, squash-merges |

This loop repeats identically no matter which stack got picked in Step 2 —
the stack choice only affects what got scaffolded, never how features get
built afterward.

## The manual fallback (Way 2)

For a stack outside the two presets — a one-off, a third stack being
tried — the installer isn't required:

1. Scaffold the app by hand, however fits (`create-next-app`, Vite, Astro,
   whatever isn't one of the two presets).
2. Copy `claude-md-starter`'s contents into that same folder, on top of the
   now-scaffolded app — same files the installer would have copied.
3. Open Claude Code there, run `/onboard`.

The installer is really just Way 2 automated for the two stacks used all
the time.
