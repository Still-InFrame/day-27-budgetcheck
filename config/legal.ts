import type { Realtor } from "./realtor";

/**
 * Full legal disclaimer for the affordability tool. Written to protect both the
 * tool provider and the realtor using it: estimates-only, not a lender/broker,
 * not a loan commitment, not financial/legal advice, "as is" + liability waiver,
 * Equal Housing. Parameterized by realtor so it carries the right name/brokerage
 * when this goes multi-tenant. Reviewed-by-a-real-attorney is still recommended
 * before production use under a specific brokerage.
 */
export function legalDisclaimer(r: Realtor): string[] {
  return [
    `This tool provides general estimates for educational and informational purposes only. The results are not a loan pre-qualification, pre-approval, commitment to lend, or an offer or guarantee of credit, financing, or any particular interest rate or loan terms.`,
    `Figures are estimates based on the information you provide and on assumptions — including current average mortgage rates, state-average property taxes and homeowners insurance, mortgage insurance, and standard debt-to-income guidelines. Your actual costs, eligibility, and loan terms will differ and can only be determined by a licensed lender through full underwriting.`,
    `This tool does not constitute financial, lending, mortgage, legal, tax, or investment advice, and no professional, advisory, or fiduciary relationship is created by its use. ${r.name} and ${r.brokerage} are licensed real estate professionals — not mortgage lenders, mortgage brokers, or financial advisors — and do not originate loans or extend credit. Consult a licensed mortgage lender, financial advisor, and/or attorney before making any home-buying or financial decision.`,
    `The information is provided "as is," without warranties of any kind, express or implied. To the fullest extent permitted by law, ${r.brokerage}, ${r.name}, and the providers of this tool disclaim all liability for any loss or damage arising from reliance on these estimates. All loan products are subject to credit approval and property appraisal.`,
    `Equal Housing Opportunity.`,
  ];
}
