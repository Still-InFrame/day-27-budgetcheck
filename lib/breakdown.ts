import { CLOSING_COST_PCT, pmiRate } from "@/config/constants";
import type { PaymentBreakdown } from "@/lib/types";

/**
 * Pure price → payment math, shared by the server estimate and the client-side
 * price slider so both always agree. No server-only imports — safe in the browser.
 */

/** Monthly principal + interest for a given loan amount. */
function monthlyPI(loan: number, annualRatePct: number, termYears: number): number {
  if (loan <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

export interface BreakdownParams {
  downPayment: number;
  annualRatePct: number;
  /** Property-tax rate as a percentage, e.g. 0.82 for 0.82%. */
  taxRatePct: number;
  insuranceAnnual: number;
  termYears: number;
}

/** Full monthly cost breakdown at a specific purchase price. */
export function breakdownAtPrice(price: number, p: BreakdownParams): PaymentBreakdown {
  const loanAmount = Math.max(0, price - p.downPayment);
  const downPct = price > 0 ? p.downPayment / price : 1;
  const principalAndInterest = monthlyPI(loanAmount, p.annualRatePct, p.termYears);
  const propertyTax = (price * (p.taxRatePct / 100)) / 12;
  const insurance = p.insuranceAnnual / 12;
  const pmi = (loanAmount * pmiRate(downPct)) / 12;
  return {
    price,
    loanAmount,
    downPayment: p.downPayment,
    principalAndInterest,
    propertyTax,
    insurance,
    pmi,
    totalMonthly: principalAndInterest + propertyTax + insurance + pmi,
  };
}

/** Estimated cash needed at closing: down payment + closing costs. */
export function cashToClose(price: number, downPayment: number): number {
  return downPayment + price * CLOSING_COST_PCT;
}
