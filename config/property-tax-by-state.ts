/**
 * Effective property-tax rate by state — taxes paid as a share of home value,
 * for owner-occupied homes. Modeled on Tax Foundation / Census ACS (table B25103)
 * data, as of 2024 (latest) — refresh annually from:
 *   https://taxfoundation.org/data/all/state/property-taxes-by-state-county/
 *
 * Values are decimals (0.0223 = 2.23%). Used as: monthlyTax = price * rate / 12.
 */
export const PROPERTY_TAX_RATE: Record<string, number> = {
  AL: 0.004,
  AK: 0.0104,
  AZ: 0.0062,
  AR: 0.0062,
  CA: 0.0071,
  CO: 0.0049,
  CT: 0.0192,
  DE: 0.0058,
  DC: 0.0057,
  FL: 0.0082,
  GA: 0.0089,
  HI: 0.0027,
  ID: 0.0062,
  IL: 0.0207,
  IN: 0.0083,
  IA: 0.0149,
  KS: 0.0134,
  KY: 0.0083,
  LA: 0.0055,
  ME: 0.0124,
  MD: 0.0104,
  MA: 0.0114,
  MI: 0.0136,
  MN: 0.0105,
  MS: 0.0074,
  MO: 0.0097,
  MT: 0.0074,
  NE: 0.0151,
  NV: 0.0054,
  NH: 0.0186,
  NJ: 0.0223,
  NM: 0.0073,
  NY: 0.014,
  NC: 0.0078,
  ND: 0.0098,
  OH: 0.0153,
  OK: 0.0085,
  OR: 0.0086,
  PA: 0.0143,
  RI: 0.0134,
  SC: 0.0055,
  SD: 0.0114,
  TN: 0.0063,
  TX: 0.0163,
  UT: 0.0055,
  VT: 0.0178,
  VA: 0.0081,
  WA: 0.0084,
  WV: 0.0055,
  WI: 0.0151,
  WY: 0.0055,
};

/** National-average fallback (~0.86%) if a state code is missing. */
const NATIONAL_AVG_TAX_RATE = 0.0086;

export function propertyTaxRate(stateCode: string): number {
  return PROPERTY_TAX_RATE[stateCode] ?? NATIONAL_AVG_TAX_RATE;
}
