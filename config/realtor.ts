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
  phone: "",
  email: "savion@stillinframe.com",
  accent: "#BE9849",
  tagline: "Miami native, Cuban-American, and your tech-forward advisor for buying right.",
  bio: [
    "Savion Smith is recognized for his entrepreneurial drive and fearless approach to challenges. His rich cultural heritage and passion for travel and culinary exploration broaden his perspectives, enabling him to connect with clients from various backgrounds. More than a real estate agent, Savion is a trusted advisor, upholding honesty, empathy, and respect in all interactions. His innovative mindset, commitment to self-improvement, and strategic use of technology make him an invaluable asset in the real estate industry.",
    "A Miami native and proud Cuban-American, Savion stands out with his innovative approach and unwavering commitment to excellence. His journey into real estate, inspired by a family background in the field, showcases his entrepreneurial spirit and self-taught expertise. Founder of Still in Frame Creatives, a creative agency in Miami, Savion has developed a diverse range of design and development skills. His experience at Apple has honed his strategic business insights and deepened his understanding of technology's role in enhancing real estate services. Additionally, Savion's FAA-certified Remote Pilot qualification provides a unique edge in property marketing, offering innovative ways to showcase homes.",
    "Savion's professional ethos reflects his connection to the city and its diverse communities. He values family and relationships, principles that he integrates into his work, dedicating himself to his client's success and satisfaction. With his unique skill set, entrepreneurial spirit, and innovative approach, Savion Smith is an exceptional real estate agent, consistently exceeding expectations and inspiring confidence in everyone he works with.",
  ],
  area: "Miami",
  highlights: [
    { value: "Miami Native", label: "A true local market expert" },
    { value: "Cuban-American", label: "Bilingual, multicultural service" },
    { value: "Apple-Trained", label: "A technology-forward edge" },
    { value: "FAA-Certified Pilot", label: "Drone-powered home marketing" },
  ],
};
