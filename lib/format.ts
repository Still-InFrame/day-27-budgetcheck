/** $1,234 — whole dollars. */
export function money(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/** "$420K" / "$1.2M" — compact, for headlines. */
export function moneyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

/** A friendly price band like "the $400Ks". */
export function priceBand(n: number): string {
  const hundredK = Math.floor(n / 100_000) * 100;
  if (hundredK >= 1000) return moneyShort(n);
  return `the $${hundredK}Ks`;
}
