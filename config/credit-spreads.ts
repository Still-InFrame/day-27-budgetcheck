/**
 * Credit-tier rate spreads, added on top of the live Freddie Mac 30-yr base rate
 * (FRED MORTGAGE30US, which reflects top-tier ~760+ borrowers).
 *
 * Spreads are stable; only the base rate moves week to week. Figures modeled on
 * myFICO / Curinos rate-by-FICO tables as of June 2026 — refresh annually.
 */
export type CreditRange =
  | "excellent" // 760+
  | "veryGood" // 720–759
  | "good" // 680–719
  | "fair" // 640–679
  | "belowAvg" // 620–639
  | "poor"; // below 620

export interface CreditTier {
  value: CreditRange;
  label: string;
  /** Percentage points added to the base 30-yr rate. */
  spread: number;
  /** Shown when this tier may need an FHA/specialty loan. */
  note?: string;
}

export const CREDIT_TIERS: CreditTier[] = [
  { value: "excellent", label: "Excellent (760+)", spread: 0.0 },
  { value: "veryGood", label: "Very good (720–759)", spread: 0.1 },
  { value: "good", label: "Good (680–719)", spread: 0.3 },
  { value: "fair", label: "Fair (640–679)", spread: 0.65 },
  { value: "belowAvg", label: "Below average (620–639)", spread: 1.1 },
  {
    value: "poor",
    label: "Building credit (below 620)",
    spread: 1.75,
    note: "An FHA or specialty loan may fit better — your agent can connect you with a lender.",
  },
];

export function creditTier(value: CreditRange): CreditTier {
  return CREDIT_TIERS.find((t) => t.value === value) ?? CREDIT_TIERS[0];
}

/** The next-better tier (for "what if my credit improved" insights), or null at the top. */
export function betterTier(value: CreditRange): CreditTier | null {
  const i = CREDIT_TIERS.findIndex((t) => t.value === value);
  return i > 0 ? CREDIT_TIERS[i - 1] : null;
}
