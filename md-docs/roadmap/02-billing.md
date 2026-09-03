# Phase 2 — Billing

The foundation the whole roles/plan design sits on: paying is what
creates an organization. Nothing here is optional if this is meant to be
a real product.

## Locked decisions

- **Processor: Stripe.** Recommended default — most mature Next.js
  ecosystem support, handles per-seat/quantity subscriptions natively,
  well-documented webhooks. Flagging this explicitly as **your call to
  confirm** before Phase 2 starts, not something to silently assume.
- **Stripe Checkout (hosted), not a custom payment form** — faster to
  ship, PCI compliance handled entirely by Stripe. Matches the "ugly,
  working checkout beats a beautiful app with no way to charge anyone"
  principle.
- **Billing model: Stripe subscriptions with quantity = seat count** —
  Stripe's native quantity-based pricing maps directly onto the per-seat
  curves already defined in `ROLES-AND-BILLING-PLAN.md`, rather than
  building custom invoicing logic.
- **`organization.plan` (already exists, currently unused) becomes the
  live trigger** for the plan-limits config from Phase 1 — a Stripe
  webhook updates it on checkout completion and on every subscription
  change.
- **A downgrade that would put the org over the new plan's seat limit
  gets blocked**, not auto-applied — the org has to remove members down
  to the new limit first. Simple, safe default; revisit only if it
  turns out to be a real support burden.

## Checklist

- [ ] Create a Stripe account, get API keys (test mode first)
- [ ] Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY` to `.env.example`, `.env.local`, and Vercel
- [ ] Define 3 Stripe Products (Plan A/B/C) using tiered/graduated pricing matching the seat curves
- [ ] Rebuild `/onboarding`: name workspace → pick plan → Stripe Checkout redirect
- [ ] Build the webhook handler (`/api/webhooks/stripe`) for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] On `checkout.session.completed`: create the organization, set the paying user as owner, set `organization.plan`
- [ ] On subscription update/cancel: update `organization.plan` and seat count accordingly
- [ ] Handle a failed payment with at minimum a visible banner/locked state — not full dunning management yet

## Deferred, on purpose

- Annual billing.
- Coupons / discounts.
- Proration math itself beyond what Stripe's own quantity-change handling covers automatically.
- Manual/enterprise invoicing outside Stripe Checkout.

## Exit condition

A second real, paying organization can come into existence without a
developer touching the database.
