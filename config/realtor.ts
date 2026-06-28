/**
 * Realtor branding for the lead magnet + landing page.
 *
 * Single-tenant for now; this is the seam for going multi-tenant later (lookup
 * by realtorId). Everything on the landing page reads from this object, so
 * rebranding is a one-file change.
 */
export interface Realtor {
  id: string;
  name: string;
  brokerage: string;
  /** Leave empty to hide the "call" CTA (email-only). */
  phone: string;
  email: string;
  /** Real estate license number, shown in the footer for compliance. */
  license: string;
  /** Tailwind-friendly brand accent (hex). */
  accent: string;
  // --- landing page / marketing ---
  tagline: string;
  bio: string[];
  area: string;
  /** Real differentiators shown in the highlights strip (no invented stats). */
  highlights: { value: string; label: string }[];
}

export const REALTOR: Realtor = {
  id: "savion",
  name: "Savion Smith",
  brokerage: "Luxe Properties",
  phone: "(305) 495-8231",
  email: "savion@savispaces.com",
  license: "3594792",
  accent: "#BE9849",
  tagline: "Miami native, Cuban-American, and your tech-forward advisor for buying right.",
  bio: [
    "A Miami native and proud Cuban-American, Savion brings entrepreneurial drive and a fearless approach to every client he serves. More than an agent, he's a trusted advisor — leading with honesty, empathy, and respect, and connecting easily with people from all walks of life.",
    "Self-taught and tech-forward, Savion founded the Miami marketing agency Managed Marketing Partners, sharpened his business instincts at a top technology company, and earned an FAA Remote Pilot certification that gives his listings a cutting-edge marketing edge. Grounded in family and community, he's devoted to his clients' success — and to making the path to homeownership clear, confident, and genuinely enjoyable.",
  ],
  area: "Miami",
  highlights: [
    { value: "Born & Raised in Miami", label: "Deep, street-level local expertise" },
    { value: "Marketing Agency Founder", label: "Your home marketed like a brand" },
    { value: "Top-Tech Trained", label: "Strategy & negotiation from big tech" },
    { value: "FAA-Licensed Drone Pilot", label: "Cinematic marketing few agents offer" },
  ],
};
