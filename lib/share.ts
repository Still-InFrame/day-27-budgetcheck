import { CREDIT_TIERS, type CreditRange } from "@/config/credit-spreads";
import { PROPERTY_TAX_RATE } from "@/config/property-tax-by-state";
import type { AffordabilityInputs } from "@/lib/types";

const VALID_CREDIT = new Set(CREDIT_TIERS.map((t) => t.value));

/** Encode the buyer's inputs into a compact query string for a shareable link. */
export function encodeShare(inputs: Partial<AffordabilityInputs>, name?: string): string {
  const p = new URLSearchParams();
  if (inputs.state) p.set("s", inputs.state);
  p.set("i", String(Math.round(inputs.annualIncome ?? 0)));
  p.set("d", String(Math.round(inputs.monthlyDebts ?? 0)));
  p.set("dp", String(Math.round(inputs.downPayment ?? 0)));
  if (inputs.creditRange) p.set("c", inputs.creditRange);
  if (inputs.comfortPayment) p.set("cp", String(Math.round(inputs.comfortPayment)));
  if (name) p.set("n", name);
  return p.toString();
}

type Params = Record<string, string | string[] | undefined>;

/** Parse + validate inputs from a shared link's query params. */
export function decodeShare(sp: Params): { inputs: AffordabilityInputs; name: string } {
  const get = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const num = (k: string) => {
    const n = Number.parseFloat(get(k));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const stateCode = get("s");
  const state = stateCode in PROPERTY_TAX_RATE ? stateCode : "";
  const c = get("c");
  const creditRange: CreditRange = VALID_CREDIT.has(c as CreditRange)
    ? (c as CreditRange)
    : "good";
  const cp = num("cp");

  return {
    inputs: {
      state,
      annualIncome: num("i"),
      monthlyDebts: num("d"),
      downPayment: num("dp"),
      creditRange,
      comfortPayment: cp > 0 ? cp : undefined,
      termYears: 30,
    },
    name: get("n").slice(0, 40),
  };
}
