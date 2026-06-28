/**
 * Core lending assumptions used by the affordability engine.
 * These are "current standard figures" as of June 2026 — refresh annually.
 *
 * DTI (debt-to-income) is how lenders cap your housing payment:
 *  - front-end: housing payment as a share of gross income
 *  - back-end:  (housing + all other debts) as a share of gross income
 *
 * We model two scenarios:
 *  - "comfortable" (conservative): 28% front / 36% back
 *  - "stretch"     (aggressive):   31% front / 43% back  (43% is the QM ceiling)
 */
export const DTI = {
  comfortable: { frontEnd: 0.28, backEnd: 0.36 },
  stretch: { frontEnd: 0.31, backEnd: 0.43 },
} as const;

/** Estimated closing costs as a share of purchase price (typical range 2–5%). */
export const CLOSING_COST_PCT = 0.03;

/** Default mortgage term in years. */
export const DEFAULT_TERM_YEARS = 30;

/**
 * Annual PMI (private mortgage insurance) rate as a share of the loan amount,
 * required when the down payment is under 20%. Scaled by down-payment size —
 * smaller down payments carry higher PMI.
 */
export function pmiRate(downPaymentPct: number): number {
  if (downPaymentPct >= 0.2) return 0; // no PMI at 20%+ down
  if (downPaymentPct >= 0.15) return 0.004;
  if (downPaymentPct >= 0.1) return 0.007;
  return 0.009;
}

/** Below this financeable loan amount we treat the result as "not yet qualified". */
export const MIN_VIABLE_LOAN = 25_000;
