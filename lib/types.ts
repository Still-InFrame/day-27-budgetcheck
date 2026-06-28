import type { CreditRange } from "@/config/credit-spreads";

/** Raw inputs collected from the wizard. */
export interface AffordabilityInputs {
  state: string;
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  creditRange: CreditRange;
  /** Optional: the monthly payment the buyer says they're comfortable with. */
  comfortPayment?: number;
  termYears: number;
}

/** Monthly cost breakdown at a given purchase price. */
export interface PaymentBreakdown {
  price: number;
  loanAmount: number;
  downPayment: number;
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  totalMonthly: number;
}

/** A single "what changes your number" lever. */
export interface Insight {
  label: string;
  /** Dollar change to the comfortable price (can be positive or negative). */
  priceDelta: number;
  /** Plain-English reason this move helps (personalized). */
  detail: string;
}

/** What's currently capping the buyer's comfortable budget. */
export type LimitingFactor = "income" | "debts" | "comfort";

export interface AffordabilityResult {
  qualified: boolean;
  rate: number; // annual %, base + credit spread
  baseRate: number; // the live FRED base, before spread
  creditNote?: string;
  stateCode: string; // the state these tax/insurance figures are for
  propertyTaxRatePct: number; // e.g. 0.82 (% of home value), for display
  insuranceAnnual: number; // state average annual premium, for display
  limitingFactor: LimitingFactor; // what's capping the comfortable budget
  priceLow: number; // comfortable (28/36 DTI, capped by comfort payment)
  priceHigh: number; // stretch (31/43 DTI)
  breakdown: PaymentBreakdown; // computed at priceLow (the comfortable number)
  cashToClose: number; // down payment + closing costs at priceLow
  maxMonthlyHousing: number; // the comfortable PITI ceiling
  insights: Insight[];
}
