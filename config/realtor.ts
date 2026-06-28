/**
 * Realtor branding for the lead magnet.
 *
 * MVP: a single placeholder realtor. This is the multi-tenant seam — later this
 * becomes a lookup keyed by realtorId (from an /embed/[realtorId] route), with
 * each realtor's branding + CRM key stored per-tenant. For now the whole app
 * reads this one object, and leads are tagged with `id` so nothing has to change
 * structurally when we add real per-realtor configs.
 */
export interface Realtor {
  id: string;
  name: string;
  brokerage: string;
  phone: string;
  email: string;
  /** Tailwind-friendly brand accent (hex). */
  accent: string;
}

export const REALTOR: Realtor = {
  id: "default",
  name: "Jordan Avery",
  brokerage: "Avery Home Group",
  phone: "(555) 123-4567",
  email: "jordan@averyhomegroup.com",
  accent: "#2563eb",
};
