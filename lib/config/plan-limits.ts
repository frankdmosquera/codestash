export type PlanTier = "trial" | "A" | "B" | "C";

interface SeatPricing {
  basePrice: number;
  firstSeatIncrement: number;
  steadySeatRate: number;
}

export interface PlanLimits {
  maxCategories: number | null;
  customBackgrounds: boolean;
  // Content-structure ceilings, locked 2026-09-05 alongside the trial tier.
  // maxNestingDepth and maxCharsPerSection are deliberately the SAME across
  // every tier, trial included — they're legibility/render-performance
  // limits, not something anyone should have to pay more to get more of.
  // maxSectionsPerManual is the one that actually scales by plan, since
  // it's the genuine "how much can this workspace hold" lever.
  maxSectionsPerManual: number | null;
  maxNestingDepth: number;
  maxCharsPerSection: number;
  seatPricing: SeatPricing | null;
}

export const CONTENT_STRUCTURE_LIMITS = {
  maxNestingDepth: 4,
  maxCharsPerSection: 2000,
};

// Numbers locked in md-docs/ROLES-AND-BILLING-PLAN.md 2026-09-04 (seat
// pricing) and 2026-09-05 (content-structure ceilings + the trial tier).
// Seat price for n seats: n=1 -> basePrice, n=2 -> basePrice + firstSeatIncrement,
// n>=3 -> that n=2 price + steadySeatRate * (n - 2).
//
// "trial" also stands in for `organization.plan`'s real-world default
// ("free") — every org today, including the real Codestash workspace, sits
// on that placeholder since Phase 2 billing doesn't exist yet to assign a
// real plan. See getPlanLimits() below for the actual lookup, which
// tolerates that string rather than assuming every org.plan is a PlanTier.
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  trial: {
    maxCategories: 2,
    customBackgrounds: false,
    maxSectionsPerManual: 10,
    ...CONTENT_STRUCTURE_LIMITS,
    seatPricing: null, // not a paid tier — no seat price to quote
  },
  A: {
    maxCategories: null,
    customBackgrounds: true,
    maxSectionsPerManual: null,
    ...CONTENT_STRUCTURE_LIMITS,
    seatPricing: { basePrice: 10, firstSeatIncrement: 8, steadySeatRate: 7 },
  },
  B: {
    maxCategories: 15,
    customBackgrounds: true,
    maxSectionsPerManual: 50,
    ...CONTENT_STRUCTURE_LIMITS,
    seatPricing: { basePrice: 7, firstSeatIncrement: 6, steadySeatRate: 5 },
  },
  C: {
    maxCategories: 5,
    customBackgrounds: false,
    maxSectionsPerManual: 20,
    ...CONTENT_STRUCTURE_LIMITS,
    seatPricing: { basePrice: 5, firstSeatIncrement: 4, steadySeatRate: 3 },
  },
};

// The one place that turns organization.plan's raw string into real limits.
// Anything that isn't a recognized PlanTier (today, always "free" — the
// column's default, since nothing has assigned a real plan yet) falls back
// to "trial" rather than throwing, since a live org with real content
// (Codestash included) has to resolve to *something*.
export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  if (plan && plan in PLAN_LIMITS) {
    return PLAN_LIMITS[plan as PlanTier];
  }
  return PLAN_LIMITS.trial;
}
