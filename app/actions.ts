"use server";

import { DEFAULT_TERM_YEARS } from "@/config/constants";
import { CREDIT_TIERS, type CreditRange } from "@/config/credit-spreads";
import { PROPERTY_TAX_RATE } from "@/config/property-tax-by-state";
import { REALTOR } from "@/config/realtor";
import { calculateAffordability } from "@/lib/affordability";
import { getBaseRate } from "@/lib/rate";
import { getSupabase } from "@/lib/supabase";
import type { AffordabilityInputs, AffordabilityResult } from "@/lib/types";

const VALID_CREDIT = new Set(CREDIT_TIERS.map((t) => t.value));

/** Coerce/clamp untrusted client input into a safe shape for the engine. */
function normalize(raw: Partial<AffordabilityInputs>): AffordabilityInputs {
  const num = (v: unknown, min = 0) => {
    const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? ""));
    return Number.isFinite(n) && n > min ? n : 0;
  };
  const state =
    typeof raw.state === "string" && raw.state in PROPERTY_TAX_RATE ? raw.state : "";
  const creditRange: CreditRange =
    typeof raw.creditRange === "string" && VALID_CREDIT.has(raw.creditRange as CreditRange)
      ? (raw.creditRange as CreditRange)
      : "good";
  const comfort = num(raw.comfortPayment);

  return {
    state,
    annualIncome: num(raw.annualIncome),
    monthlyDebts: num(raw.monthlyDebts),
    downPayment: num(raw.downPayment),
    creditRange,
    comfortPayment: comfort > 0 ? comfort : undefined,
    termYears: raw.termYears === 15 ? 15 : DEFAULT_TERM_YEARS,
  };
}

/** Compute the estimate for the teaser (no lead stored yet). */
export async function estimate(
  raw: Partial<AffordabilityInputs>,
): Promise<AffordabilityResult> {
  const inputs = normalize(raw);
  const baseRate = await getBaseRate();
  return calculateAffordability(inputs, baseRate);
}

export interface LeadContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  buyingTimeline?: string;
  consent: boolean;
  /** Honeypot — must be empty for a real human. */
  company?: string;
}

export interface SubmitResult {
  ok: boolean;
  /** UUID of the stored lead — used to route to /r/[id]. */
  resultId?: string;
  error?: string;
}

/**
 * Store the lead and return the full (server-recomputed) result to unlock.
 * Recomputes the numbers server-side rather than trusting whatever the client
 * sends, so the stored + displayed figures are authoritative.
 */
export async function submitLead(
  contact: LeadContact,
  raw: Partial<AffordabilityInputs>,
): Promise<SubmitResult> {
  const inputs = normalize(raw);
  const baseRate = await getBaseRate();
  const result = calculateAffordability(inputs, baseRate);

  const first = contact.firstName?.trim();
  const last = contact.lastName?.trim();
  const email = contact.email?.trim();
  const phone = contact.phone?.trim();
  if (!first || !last || !email || !phone) {
    return { ok: false, error: "Please fill in your name, email, and phone." };
  }
  if (!contact.consent) {
    return { ok: false, error: "Please agree to be contacted to see your results." };
  }
  // Honeypot: a real human never fills this hidden field — drop obvious bots.
  if (contact.company && contact.company.trim() !== "") {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  // The lead id doubles as the UUID for the shareable results page (/r/[id]).
  const id = crypto.randomUUID();
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("budgetcheck_leads").insert({
      id,
      realtor_id: REALTOR.id,
      first_name: first,
      last_name: last,
      email,
      phone,
      buying_timeline: contact.buyingTimeline ?? null,
      consent: contact.consent,
      state: inputs.state || null,
      annual_income: inputs.annualIncome,
      monthly_debts: inputs.monthlyDebts,
      down_payment: inputs.downPayment,
      credit_range: inputs.creditRange,
      comfort_payment: inputs.comfortPayment ?? null,
      est_price_low: Math.round(result.priceLow),
      est_price_high: Math.round(result.priceHigh),
      rate_used: result.rate,
    });
    if (error) {
      return { ok: false, error: "Something went wrong saving your info. Please try again." };
    }
  } catch {
    return { ok: false, error: "Something went wrong saving your info. Please try again." };
  }

  return { ok: true, resultId: id };
}
