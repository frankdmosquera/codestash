# Phase 0 — Stabilize

**Status: you are here.** See `../ROADMAP.md` for how this fits with the
other phases.

Fix what's actually live before doing anything else. No architecture
work starts until production is honest again.

## Locked decisions

- CI runs on **every push to any branch**, not just PRs into `main` —
  catches breakage before it's even proposed for merge.
- CI is **GitHub Actions** — the repo's already hosted there, no new
  tool to adopt.
- The 500 gets root-caused from the **actual Vercel runtime log**, not
  guessed at from client-side symptoms — see the diagnosis already
  started in this project's chat history if resuming this later.

## Checklist

- [x] Pull the real Vercel runtime log for a failing `/api/auth/get-session` request
- [x] Identify the actual cause — `NEXT_PUBLIC_APP_URL` was set to `codestash-ten.vercel.app`
      with no `https://` scheme, so better-auth's `new URL(baseURL)` threw
      `BetterAuthError: Invalid base URL` on every request that touches `lib/auth.ts`
- [x] Fix it and confirm `/` and every `/api/auth/*` route returns 200 in production —
      fixed 2026-09-03 by correcting the Production env var value and redeploying
- [ ] Add `.github/workflows/ci.yml` running `npm run lint`, `tsc --noEmit`, `npm run build`
- [ ] Commit `.env.example` (already written, was sitting uncommitted as of this doc)

## Deferred, on purpose

- Full test suite — Phase 6.
- Error monitoring (Sentry or similar) — Phase 6.

## Exit condition

Production serves every route without a 500, and a broken build or
failing typecheck can't merge without at least a visible red flag in CI.
