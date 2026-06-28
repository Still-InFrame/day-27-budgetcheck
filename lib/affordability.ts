import { DTI, MIN_VIABLE_LOAN, pmiRate } from "@/config/constants";
import { betterTier, creditTier } from "@/config/credit-spreads";
import { insuranceAnnual } from "@/config/insurance-by-state";
import { propertyTaxRate } from "@/config/property-tax-by-state";
import { breakdownAtPrice, cashToClose } from "@/lib/breakdown";
import type {
  AffordabilityInputs,
  AffordabilityResult,
  Insight,
  LimitingFactor,
  PaymentBreakdown,
} from "@/lib/types";

/**
 * Maximum loan principal supported by a given monthly principal-and-interest
 * budget, via the standard mortgage payment formula solved for principal.
 */
function maxLoanForPayment(
  piBudget: number,
  annualRatePct: number,
  termYears: number,
): number {
  if (piBudget <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return piBudget * n;
  return (piBudget * (1 - Math.pow(1 + r, -n))) / r;
}

/**
 * Given a maximum total monthly housing payment (PITI), solve for the highest
 * purchase price. Taxes, insurance, and PMI all depend on the price (and PMI on
 * the loan-to-value), which depends on the price — so we iterate to convergence.
 */
function solvePrice(
  maxPITI: number,
  inputs: AffordabilityInputs,
  annualRatePct: number,
): PaymentBreakdown {
  const { downPayment, state, termYears } = inputs;
  const taxRate = propertyTaxRate(state);
  const annualIns = insuranceAnnual(state);
  const monthlyIns = annualIns / 12;

  // Initial guess ignores taxes/insurance, then we tighten it each pass.
  let price = downPayment + maxLoanForPayment(maxPITI, annualRatePct, termYears);

  for (let i = 0; i < 10; i++) {
    const loan = Math.max(0, price - downPayment);
    const downPct = price > 0 ? downPayment / price : 1;
    const monthlyTax = (price * taxRate) / 12;
    const monthlyPMI = (loan * pmiRate(downPct)) / 12;
    const piBudget = maxPITI - monthlyTax - monthlyIns - monthlyPMI;
    const newLoan = maxLoanForPayment(piBudget, annualRatePct, termYears);
    price = Math.max(downPayment, newLoan + downPayment);
  }

  return breakdownAtPrice(price, {
    downPayment,
    annualRatePct,
    taxRatePct: taxRate * 100,
    insuranceAnnual: annualIns,
    termYears,
  });
}

/** The comfortable + stretch PITI ceilings from DTI limits and (optionally) comfort. */
function housingCeilings(inputs: AffordabilityInputs) {
  const grossMonthly = inputs.annualIncome / 12;
  const ceiling = (frontEnd: number, backEnd: number) =>
    Math.max(
      0,
      Math.min(grossMonthly * frontEnd, grossMonthly * backEnd - inputs.monthlyDebts),
    );

  // Which DTI rule binds the comfortable budget — front-end (income alone) or
  // back-end (income minus other debts)?
  const frontCap = grossMonthly * DTI.comfortable.frontEnd;
  const backCap = grossMonthly * DTI.comfortable.backEnd - inputs.monthlyDebts;
  let comfortable = ceiling(DTI.comfortable.frontEnd, DTI.comfortable.backEnd);
  const stretch = ceiling(DTI.stretch.frontEnd, DTI.stretch.backEnd);

  let limitingFactor: LimitingFactor = frontCap <= backCap ? "income" : "debts";

  // The buyer's stated comfort caps the "comfortable" number (never the stretch).
  if (inputs.comfortPayment && inputs.comfortPayment > 0 && inputs.comfortPayment < comfortable) {
    comfortable = inputs.comfortPayment;
    limitingFactor = "comfort";
  }
  return { comfortable, stretch, limitingFactor };
}

/** Price for a tweaked copy of the inputs — used for "what changes your number". */
function comfortablePriceFor(
  inputs: AffordabilityInputs,
  annualRatePct: number,
): number {
  const { comfortable } = housingCeilings(inputs);
  return solvePrice(comfortable, inputs, annualRatePct).price;
}

function buildInsights(
  inputs: AffordabilityInputs,
  baseRate: number,
  basePrice: number,
): Insight[] {
  const insights: Insight[] = [];
  const rateFor = (range: typeof inputs.creditRange) =>
    baseRate + creditTier(range).spread;
  const currentRate = rateFor(inputs.creditRange);

  // Lever 1: +$10,000 down payment.
  const moreDown = comfortablePriceFor(
    { ...inputs, downPayment: inputs.downPayment + 10_000 },
    currentRate,
  );
  insights.push({
    label: "Add $10,000 to your down payment",
    priceDelta: moreDown - basePrice,
    detail:
      "A bigger down payment goes toward your price and can lower your monthly mortgage insurance — raising what you can comfortably afford.",
  });

  // Lever 2: pay down $250/mo of debt (only meaningful if they have debt).
  if (inputs.monthlyDebts > 0) {
    const lessDebt = comfortablePriceFor(
      { ...inputs, monthlyDebts: Math.max(0, inputs.monthlyDebts - 250) },
      currentRate,
    );
    insights.push({
      label: "Reduce monthly debts by $250",
      priceDelta: lessDebt - basePrice,
      detail:
        "Lenders cap your total monthly obligations, so every dollar of debt you clear is a dollar they let you put toward a mortgage instead.",
    });
  }

  // Lever 3: improve credit to the next tier (only if not already top).
  const better = betterTier(inputs.creditRange);
  if (better) {
    const betterRate = baseRate + better.spread;
    const betterPrice = comfortablePriceFor(inputs, betterRate);
    insights.push({
      label: `Raise your credit to ${better.label}`,
      priceDelta: betterPrice - basePrice,
      detail:
        "A higher score earns a lower interest rate, so the same monthly payment covers a bigger loan — and a pricier home.",
    });
  }

  // Keep only levers that move the needle by at least $1k.
  return insights.filter((i) => Math.abs(i.priceDelta) >= 1000);
}

/**
 * The core estimate. `baseRate` is the live FRED 30-yr rate (before credit spread).
 */
export function calculateAffordability(
  inputs: AffordabilityInputs,
  baseRate: number,
): AffordabilityResult {
  const tier = creditTier(inputs.creditRange);
  const rate = baseRate + tier.spread;

  const { comfortable, stretch, limitingFactor } = housingCeilings(inputs);
  const lowBreakdown = solvePrice(comfortable, inputs, rate);
  const highBreakdown = solvePrice(stretch, inputs, rate);

  const qualified = lowBreakdown.loanAmount >= MIN_VIABLE_LOAN;
  const cash = cashToClose(lowBreakdown.price, inputs.downPayment);

  return {
    qualified,
    rate,
    baseRate,
    creditNote: tier.note,
    stateCode: inputs.state,
    propertyTaxRatePct: propertyTaxRate(inputs.state) * 100,
    insuranceAnnual: insuranceAnnual(inputs.state),
    limitingFactor,
    priceLow: lowBreakdown.price,
    priceHigh: Math.max(highBreakdown.price, lowBreakdown.price),
    breakdown: lowBreakdown,
    cashToClose: cash,
    maxMonthlyHousing: comfortable,
    insights: qualified ? buildInsights(inputs, baseRate, lowBreakdown.price) : [],
  };
}
