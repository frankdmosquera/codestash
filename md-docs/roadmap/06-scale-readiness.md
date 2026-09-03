# Phase 6 — Scale Readiness

Coverage grows exactly where the stakes are highest — money and access
control — not as blanket coverage for its own sake.

## Locked decisions

- **Test framework: Vitest.** Recommended default — fast, works cleanly
  with Next.js + TypeScript, no strong reason to reach for Jest instead.
  Flagged as confirm-before-building, same as the Stripe choice in
  Phase 2.
- **Test scope is deliberately narrow at first**: the permission helper
  (`requireOrgRole`), the plan-limit checks, the seat-cap checks, and the
  Stripe webhook handler. Not a blanket push for coverage everywhere.
- **Error monitoring: Sentry** (or equivalent) — standard choice, clean
  Next.js integration.

## Checklist

- [ ] Add Vitest, write tests for `requireOrgRole`
- [ ] Write tests for plan-limit and seat-cap enforcement
- [ ] Write tests for the Stripe webhook handler (mocked events)
- [ ] Wire up Sentry (or chosen tool) for both client and server error capture
- [ ] Re-verify the infra-swap boundary: confirm nothing outside `lib/db`, `lib/actions`, `lib/auth` imports Neon or better-auth specifics directly

## Deferred, on purpose

- Full end-to-end test suite.
- Load testing.

## Exit condition

Ready to hold up under real, paying usage — not just "it worked when I tried it."
