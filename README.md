# BudgetCheck — Home Affordability Lead Magnet

Day 27 of the 100-Day AI Build Challenge.

A mobile-first home-affordability calculator built as a **lead magnet for realtors**. A
buyer answers a few quick questions, sees a teaser, converts into a lead (stored in
Supabase), then unlocks a full, accurate affordability breakdown.

## What it does

- **Multi-step wizard** — state, income, monthly debts, down payment, credit range, and an
  optional "comfortable payment."
- **Accurate math** — affordability from real lending rules (28/36 → 43% DTI), the **live
  Freddie Mac 30-yr rate** (via the FRED API, weekly-cached), a credit-tier rate spread,
  and **state-level property tax + insurance**.
- **Teaser → gate → results** — shows a price band, captures the lead (name, email, phone,
  buying timeline, consent), then reveals the full breakdown: price range, monthly payment
  table, **cash-to-close**, and "what could change your number" insights.
- **Graceful "not yet" path** — buyers who don't qualify today still get an encouraging,
  lead-capturing next step rather than a dead end.

## Architecture

| Concern | Where | Why |
|---|---|---|
| Property tax / insurance / credit spreads | `config/*` (git-versioned) | Slow-moving; want version history, no runtime DB call |
| Base mortgage rate | `lib/rate.ts` — FRED fetch, `revalidate: 604800` + `config/base-rate.ts` fallback | Weekly; durable on Vercel's Data Cache |
| Leads | Supabase `leads` table (RLS, insert-only) | The one thing that's actually a database |
| Math | `lib/affordability.ts` (pure) + `app/actions.ts` (server) | Computed server-side, never trusts the client |

Built so the deferred pieces (HighLevel CRM push, realtor auth, `/embed/[realtorId]`
multi-tenant) slot in via existing seams — `realtor_id` on every lead, a single
`config/realtor.ts` object, and an isolated lead-delivery path.

## Local development

```bash
cp .env.local.example .env.local   # fill in FRED + Supabase values
npm install
npm run dev
```

## Environment variables

Set these locally (`.env.local`) **and** in the Vercel dashboard:

- `FRED_API_KEY` — free key from https://fred.stlouisfed.org/docs/api/api_key.html
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` — the publishable key is safe here; the `leads` table is
  insert-only via RLS, so it can write leads but not read them.

## Deploy

```bash
./deploy.sh   # deploys to Vercel + attaches the subdomain
```

Then add the three env vars in the Vercel dashboard (Settings → Environment Variables).

## Data accuracy

Reference figures are labeled "as of June 2026." Refresh annually:
- Property tax — Tax Foundation / Census ACS table B25103
- Insurance — LendingTree / Insurance.com state averages
- Credit spreads — myFICO / Curinos

The output is a credible **estimate**, not a pre-approval — clearly disclaimed in the UI.
