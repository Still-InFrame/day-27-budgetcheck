/**
 * Fallback 30-year fixed mortgage rate (%), used only if the live FRED fetch
 * fails or returns no value. Captured from FRED MORTGAGE30US on 2026-06-25.
 * Keep this reasonably fresh so the fallback is never wildly off.
 */
export const FALLBACK_BASE_RATE = 6.49;
export const FALLBACK_BASE_RATE_AS_OF = "June 2026";
