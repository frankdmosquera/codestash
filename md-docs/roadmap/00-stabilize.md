# Phase 0 — Stabilize

See `./ROADMAP.md`'s phase table for how this fits with the other
phases and which one is current — computed from checklist state, not
hand-maintained here, so it's never stale.

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
- [x] Add `.github/workflows/ci.yml` running `npm run lint`, `tsc --noEmit`, `npm run build`
      on every push to any branch — requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, and
      `NEXT_PUBLIC_APP_URL` set as GitHub Actions repo secrets or the build step fails
- [x] Commit `.env.example` (already written, was sitting uncommitted as of this doc)
- [ ] Confirm `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`
      are actually added as GitHub Actions repo secrets — the workflow file
      exists and requires them, but a green CI run confirming they're set
      hasn't happened yet

## Deferred, on purpose

- Full test suite — Phase 6.
- Error monitoring (Sentry or similar) — Phase 6.

## Exit condition

Production serves every route without a 500, and a broken build or
failing typecheck can't merge without at least a visible red flag in CI.
