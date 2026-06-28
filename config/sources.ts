/**
 * Data sources + methodology shown in the "How this works" section, for
 * transparency and credibility. Update the `asOf` dates here whenever you
 * refresh the matching config tables — this is the single place the app cites.
 */
export interface DataSource {
  /** What it powers in the calculation. */
  label: string;
  /** Where the figure comes from. */
  source: string;
  /** Freshness note. */
  asOf: string;
  url: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    label: "30-year mortgage rate",
    source: "Freddie Mac (PMMS), via FRED — Federal Reserve Bank of St. Louis",
    asOf: "Live — refreshed weekly",
    url: "https://fred.stlouisfed.org/series/MORTGAGE30US",
  },
  {
    label: "Property tax rates by state",
    source: "Tax Foundation / U.S. Census Bureau ACS (Table B25103)",
    asOf: "2024 data (latest available)",
    url: "https://taxfoundation.org/data/all/state/property-taxes-by-state-county/",
  },
  {
    label: "Homeowners insurance by state",
    source: "LendingTree & Insurance.com state averages",
    asOf: "2025",
    url: "https://www.lendingtree.com/insurance/state-of-home-insurance/",
  },
  {
    label: "Interest-rate spread by credit tier",
    source: "myFICO Loan Savings Calculator (Curinos data)",
    asOf: "June 2026",
    url: "https://www.myfico.com/credit-education/calculators/loan-savings-calculator",
  },
  {
    label: "Debt-to-income guidelines",
    source: "Standard 28/36 rule; 43% qualified-mortgage limit (CFPB)",
    asOf: "Current",
    url: "https://www.consumerfinance.gov/owning-a-home/",
  },
];

/** Plain-English walkthrough of how a number is produced. */
export const METHODOLOGY: string[] = [
  "We start with your gross monthly income and find the housing payment lenders typically allow — about 28% of income on its own, or 36–43% once your other monthly debts are counted (the standard debt-to-income rules).",
  "If you gave us a monthly payment you're comfortable with, we never exceed it for your “comfortable” number.",
  "From that monthly budget we subtract estimated property taxes and homeowners insurance for your state, plus mortgage insurance (PMI) if your down payment is under 20%.",
  "Whatever's left is your principal-and-interest budget. Using today's live 30-year rate plus an adjustment for your credit range, we work backward to the largest loan that fits — then add your down payment to get your home price.",
  "Your range runs from a comfortable estimate (36% debt-to-income) up to a stretch (43%, the federal qualified-mortgage limit).",
  "“Cash to close” adds estimated closing costs (about 3% of the price) to your down payment.",
];

/** When the static reference tables were last refreshed. */
export const DATA_UPDATED = "June 2026";
