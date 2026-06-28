/**
 * Realtor branding for the lead magnet + landing page.
 *
 * MVP: a single placeholder realtor. This is the multi-tenant seam — later this
 * becomes a lookup keyed by realtorId (from an /embed/[realtorId] route), with
 * each realtor's branding + CRM key stored per-tenant. Everything on the landing
 * page reads from this one object, so rebranding for a real realtor is a one-file
 * change.
 */
export interface Realtor {
  id: string;
  name: string;
  brokerage: string;
  phone: string;
  email: string;
  /** Tailwind-friendly brand accent (hex). */
  accent: string;
  // --- landing page / marketing ---
  tagline: string;
  bio: string;
  yearsExperience: number;
  homesSold: number;
  volume: string; // e.g. "$1.2B+"
  rating: string; // e.g. "4.9"
  area: string; // primary market
}

export const REALTOR: Realtor = {
  id: "default",
  name: "Jordan Avery",
  brokerage: "Avery Home Group",
  phone: "(555) 123-4567",
  email: "jordan@averyhomegroup.com",
  accent: "#2563eb",
  tagline: "Helping first-time buyers find — and afford — a home they love.",
  bio: "For over a decade, Jordan has guided hundreds of families through one of the biggest decisions of their lives. Her approach is simple: real numbers, honest advice, and zero pressure. Start with your budget, and she'll handle the rest — from pre-approval to keys in hand.",
  yearsExperience: 12,
  homesSold: 500,
  volume: "$1.2B+",
  rating: "4.9",
  area: "the Greater Austin area",
};
