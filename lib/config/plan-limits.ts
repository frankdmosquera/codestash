export type PlanTier = "trial" | "A" | "B" | "C";

interface SeatPricing {
  basePrice: number;
  firstSeatIncrement: number;
  steadySeatRate: number;
}

export interface PlanLimits {
  maxCategories: number | null;
  customBackgrounds: boolean;
  // Content-structure ceilings — see ROLES-AND-BILLING-PLAN.md #7.
  // maxMainSectionsPerManual (top-level only) and maxTotalSectionsPerManual
  // (every level combined) are independent on purpose, so nesting deeper
  // never costs you top-level breadth: a manual can spend its total
  // budget on either more top-level topics or deeper structure on fewer
  // topics, never both maxed at once. maxNestingDepth scales by plan too
  // (2026-09-05 — reversed from the original "same for everyone" call,
  // now a real per-plan perk). maxCharsPerSection is still a fixed,
  // per-bullet hard ceiling for every plan (stops one bullet from
  // becoming the whole manual) — maxTotalCharsPerManual is the plan-scaled
  // aggregate on top of it, giving flexibility *across* bullets (some
  // longer, some shorter, up to the shared budget) without allowing it
  // *within* one.
  maxMainSectionsPerManual: number | null;
  maxTotalSectionsPerManual: number | null;
  maxNestingDepth: number;
  maxCharsPerSection: number;
  maxTotalCharsPerManual: number | null;
  seatPricing: SeatPricing | null;
}

// The one number that's still identical for every plan, trial included —
// a per-bullet render/legibility ceiling, not a paid feature. Everything
// else content-structure-related scales by plan (see PLAN_LIMITS below).
export const MAX_CHARS_PER_SECTION = 8000;

// Numbers locked in md-docs/ROLES-AND-BILLING-PLAN.md 2026-09-04 (seat
// pricing) and 2026-09-05 (content-structure ceilings, the trial tier,
// and the main/total split + per-plan depth + aggregate character budget).
// Seat price for n seats: n=1 -> basePrice, n=2 -> basePrice + firstSeatIncrement,
// n>=3 -> that n=2 price + steadySeatRate * (n - 2). maxTotalCharsPerManual
// is maxCharsPerSection * maxTotalSectionsPerManual for each tier — the
// same "per-bullet ceiling * total bullets" reasoning that produced
// maxTotalSectionsPerManual in the first place, just carried one step
// further into an aggregate character budget.
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
    maxMainSectionsPerManual: 10,
    maxTotalSectionsPerManual: 270,
    maxNestingDepth: 4,
    maxCharsPerSection: MAX_CHARS_PER_SECTION,
    maxTotalCharsPerManual: MAX_CHARS_PER_SECTION * 270,
    seatPricing: null, // not a paid tier — no seat price to quote
  },
  A: {
    maxCategories: null,
    customBackgrounds: true,
    maxMainSectionsPerManual: null,
    maxTotalSectionsPerManual: null,
    maxNestingDepth: 10,
    maxCharsPerSection: MAX_CHARS_PER_SECTION,
    maxTotalCharsPerManual: null,
    seatPricing: { basePrice: 10, firstSeatIncrement: 8, steadySeatRate: 7 },
  },
  B: {
    maxCategories: 15,
    customBackgrounds: true,
    maxMainSectionsPerManual: 50,
    maxTotalSectionsPerManual: 1350,
    maxNestingDepth: 8,
    maxCharsPerSection: MAX_CHARS_PER_SECTION,
    maxTotalCharsPerManual: MAX_CHARS_PER_SECTION * 1350,
    seatPricing: { basePrice: 7, firstSeatIncrement: 6, steadySeatRate: 5 },
  },
  C: {
    maxCategories: 5,
    customBackgrounds: false,
    maxMainSectionsPerManual: 20,
    maxTotalSectionsPerManual: 540,
    maxNestingDepth: 6,
    maxCharsPerSection: MAX_CHARS_PER_SECTION,
    maxTotalCharsPerManual: MAX_CHARS_PER_SECTION * 540,
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
