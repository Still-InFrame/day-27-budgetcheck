import "server-only";
import { FALLBACK_BASE_RATE } from "@/config/base-rate";

interface FredObservation {
  date: string;
  value: string; // FRED returns numbers as strings; "." means missing
}
interface FredResponse {
  observations?: FredObservation[];
}

const FRED_URL =
  "https://api.stlouisfed.org/fred/series/observations" +
  "?series_id=MORTGAGE30US&file_type=json&sort_order=desc&limit=1";

/**
 * Live Freddie Mac 30-year fixed rate via FRED, cached for 7 days (the series
 * updates weekly). On Vercel this fetch is backed by the durable Data Cache, so
 * the value persists across requests. Falls back to the committed config rate if
 * the key is missing, the request fails, or the latest value is unavailable (".").
 */
export async function getBaseRate(): Promise<number> {
  const key = process.env.FRED_API_KEY;
  if (!key) return FALLBACK_BASE_RATE;

  try {
    const res = await fetch(`${FRED_URL}&api_key=${key}`, {
      next: { revalidate: 604800 }, // 7 days
    });
    if (!res.ok) return FALLBACK_BASE_RATE;

    const data = (await res.json()) as FredResponse;
    const raw = data.observations?.[0]?.value;
    if (!raw || raw === ".") return FALLBACK_BASE_RATE;

    const rate = Number.parseFloat(raw);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 25) return FALLBACK_BASE_RATE;
    return rate;
  } catch {
    return FALLBACK_BASE_RATE;
  }
}
