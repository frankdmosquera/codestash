export type PlanTier = "A" | "B" | "C";

interface SeatPricing {
  basePrice: number;
  firstSeatIncrement: number;
  steadySeatRate: number;
}

interface PlanLimits {
  maxCategories: number | null;
  customBackgrounds: boolean;
  seatPricing: SeatPricing;
}

// Numbers locked in md-docs/ROLES-AND-BILLING-PLAN.md 2026-09-04.
// Seat price for n seats: n=1 -> basePrice, n=2 -> basePrice + firstSeatIncrement,
// n>=3 -> that n=2 price + steadySeatRate * (n - 2).
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  A: {
    maxCategories: null,
    customBackgrounds: true,
    seatPricing: { basePrice: 10, firstSeatIncrement: 8, steadySeatRate: 7 },
  },
  B: {
    maxCategories: 15,
    customBackgrounds: true,
    seatPricing: { basePrice: 7, firstSeatIncrement: 6, steadySeatRate: 5 },
  },
  C: {
    maxCategories: 5,
    customBackgrounds: false,
    seatPricing: { basePrice: 5, firstSeatIncrement: 4, steadySeatRate: 3 },
  },
};
