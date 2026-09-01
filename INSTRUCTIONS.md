# Codestash — Setup

A personal dev reference catalog (manuals, hooks, helpers, blocks, AI
instructions), built on Next.js + shadcn.

## Prerequisites

- Node.js + npm

## Install

```bash
npm install
```

## Run the dev server

```bash
npm run dev
```

Visit `/` to browse categories, or any manual directly, e.g. `/manuals/mastering-git`.
The catalog reads straight from the static files in `lib/data/` — no database
or account setup required.

## Where things stand

This branch (`main`) is the static, no-database version — everything above
is all it needs. There's an active plan to move the content layer onto a
real database with accounts and a proper admin/authoring panel (workspaces,
roles, drag-and-drop reordering, the works); the full step-by-step plan and
rationale live in the "next16-neon-better-auth" manual, browsable in-app at
`/manuals/next16-neon-better-auth` — that work happens on its own branch and
gets merged here once it's ready, so `main` stays the known-working version
in the meantime.
