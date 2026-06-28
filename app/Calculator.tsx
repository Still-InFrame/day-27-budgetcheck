"use client";

import { useState } from "react";
import { CREDIT_TIERS } from "@/config/credit-spreads";
import { US_STATES } from "@/config/insurance-by-state";
import { REALTOR } from "@/config/realtor";
import { breakdownAtPrice, cashToClose, type BreakdownParams } from "@/lib/breakdown";
import { money, moneyShort, priceBand } from "@/lib/format";
import type { AffordabilityInputs, AffordabilityResult } from "@/lib/types";
import { estimate, submitLead, type LeadContact } from "./actions";

type Phase = "wizard" | "gate" | "results";

interface FormState {
  state: string;
  annualIncome: string;
  monthlyDebts: string;
  downPayment: string;
  creditRange: string;
  comfortPayment: string;
}

const EMPTY: FormState = {
  state: "FL",
  annualIncome: "",
  monthlyDebts: "",
  downPayment: "",
  creditRange: "good",
  comfortPayment: "",
};

const TIMELINES = [
  "I'm ready now",
  "1–3 months",
  "3–6 months",
  "6–12 months",
  "Just exploring",
];

function toInputs(f: FormState): Partial<AffordabilityInputs> {
  const n = (s: string) => (s ? Number(s) : 0);
  return {
    state: f.state,
    annualIncome: n(f.annualIncome),
    monthlyDebts: n(f.monthlyDebts),
    downPayment: n(f.downPayment),
    creditRange: f.creditRange as AffordabilityInputs["creditRange"],
    comfortPayment: f.comfortPayment ? n(f.comfortPayment) : undefined,
    termYears: 30,
  };
}

export default function Calculator() {
  const [phase, setPhase] = useState<Phase>("wizard");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [teaser, setTeaser] = useState<AffordabilityResult | null>(null);
  const [result, setResult] = useState<AffordabilityResult | null>(null);
  const [personal, setPersonal] = useState<{ firstName: string; buyingTimeline: string }>({
    firstName: "",
    buyingTimeline: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const accentStyle = { ["--accent" as string]: REALTOR.accent } as React.CSSProperties;

  async function finishWizard() {
    setLoading(true);
    try {
      const r = await estimate(toInputs(form));
      setTeaser(r);
      setPhase("gate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={accentStyle}
      className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10"
    >
      {phase === "wizard" && (
        <Wizard
          form={form}
          set={set}
          step={step}
          setStep={setStep}
          loading={loading}
          onFinish={finishWizard}
        />
      )}
      {phase === "gate" && teaser && (
        <Gate
          teaser={teaser}
          inputs={toInputs(form)}
          onUnlock={(r, p) => {
            setResult(r);
            setPersonal(p);
            setPhase("results");
          }}
        />
      )}
      {phase === "results" && result && (
        <Results
          result={result}
          inputs={toInputs(form)}
          personal={personal}
          onRestart={() => {
            setForm(EMPTY);
            setStep(0);
            setTeaser(null);
            setResult(null);
            setPersonal({ firstName: "", buyingTimeline: "" });
            setPhase("wizard");
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------- Wizard -------------------------------- */

function Wizard({
  form,
  set,
  step,
  setStep,
  loading,
  onFinish,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  step: number;
  setStep: (n: number) => void;
  loading: boolean;
  onFinish: () => void;
}) {
  const steps = [
    {
      label: "What state are you buying in?",
      hint: "Property taxes and insurance vary a lot by state — this keeps your estimate honest.",
      valid: !!form.state,
      field: (
        <select
          autoFocus
          value={form.state}
          onChange={(e) => set("state", e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-lg text-slate-900 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
        >
          <option value="">Select your state…</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "What's your annual household income?",
      hint: "Total before taxes, including a co-buyer if you have one.",
      valid: Number(form.annualIncome) > 0,
      field: (
        <MoneyInput value={form.annualIncome} onChange={(v) => set("annualIncome", v)} placeholder="85,000" />
      ),
    },
    {
      label: "How much do you pay toward debts each month?",
      hint: "Car loans, credit cards, student loans, child support. Not rent or utilities.",
      valid: form.monthlyDebts !== "",
      field: (
        <MoneyInput value={form.monthlyDebts} onChange={(v) => set("monthlyDebts", v)} placeholder="450" />
      ),
    },
    {
      label: "How much cash do you have for a down payment?",
      hint: "Money you can put down. We'll also estimate closing costs on top.",
      valid: form.downPayment !== "",
      field: (
        <MoneyInput value={form.downPayment} onChange={(v) => set("downPayment", v)} placeholder="40,000" />
      ),
    },
    {
      label: "What's your estimated credit range?",
      hint: "Your best guess is fine — it sets the interest rate we use.",
      valid: !!form.creditRange,
      field: (
        <div className="grid gap-2">
          {CREDIT_TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("creditRange", t.value)}
              className={`rounded-xl border px-4 py-3 text-left text-base transition ${
                form.creditRange === t.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 font-semibold text-slate-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      label: "What monthly payment feels comfortable?",
      hint: "Optional. If your gut number is lower than what a bank allows, we'll respect it.",
      valid: true,
      optional: true,
      field: (
        <MoneyInput value={form.comfortPayment} onChange={(v) => set("comfortPayment", v)} placeholder="2,200" />
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!current.valid) return;
        if (isLast) onFinish();
        else setStep(step + 1);
      }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{current.label}</h2>
      <p className="mt-1.5 text-sm text-slate-500">{current.hint}</p>

      <div className="mt-5">{current.field}</div>

      <div className="mt-7 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!current.valid || loading}
          className="ml-auto inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Calculating…" : isLast ? "See my results →" : "Continue →"}
        </button>
      </div>

      {current.optional && (
        <button
          type="button"
          onClick={() => onFinish()}
          disabled={loading}
          className="mt-3 block w-full text-center text-sm text-slate-400 hover:text-slate-600"
        >
          Skip — I'm not sure
        </button>
      )}
    </form>
  );
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const display = value ? Number(value).toLocaleString("en-US") : "";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-slate-400">
        $
      </span>
      <input
        autoFocus
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-9 pr-4 text-lg text-slate-900 outline-none placeholder:text-slate-300 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
      />
    </div>
  );
}

/* -------------------------------- Gate --------------------------------- */

function Gate({
  teaser,
  inputs,
  onUnlock,
}: {
  teaser: AffordabilityResult;
  inputs: Partial<AffordabilityInputs>;
  onUnlock: (r: AffordabilityResult, p: { firstName: string; buyingTimeline: string }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [c, setC] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    buyingTimeline: "",
    consent: false,
    company: "", // honeypot
  });

  const headline = teaser.qualified
    ? `You're on track for a home around ${priceBand(teaser.priceLow)}`
    : "Let's build your path to homeownership";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const contact: LeadContact = { ...c };
      const res = await submitLead(contact, inputs);
      if (!res.ok || !res.result) {
        setError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      onUnlock(res.result, { firstName: c.firstName.trim(), buyingTimeline: c.buyingTimeline });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Your estimate is ready
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{headline}</h2>
        {teaser.qualified && (
          <p className="mt-2 text-slate-500">
            See your full price range, monthly payment breakdown, and the cash you'll need to close.
          </p>
        )}
      </div>

      {/* blurred preview */}
      <div className="relative mt-6">
        <div className="pointer-events-none select-none space-y-2 blur-[6px]" aria-hidden>
          <PreviewRow label="Comfortable price" value={moneyShort(teaser.priceLow)} />
          <PreviewRow label="Stretch price" value={moneyShort(teaser.priceHigh)} />
          <PreviewRow label="Est. monthly payment" value={money(teaser.breakdown.totalMonthly)} />
          <PreviewRow label="Cash to close" value={money(teaser.cashToClose)} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-white">
            🔒 Unlock below
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            name="firstName"
            autoComplete="given-name"
            value={c.firstName}
            onChange={(v) => setC({ ...c, firstName: v })}
            required
          />
          <Field
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            value={c.lastName}
            onChange={(v) => setC({ ...c, lastName: v })}
            required
          />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={c.email}
          onChange={(v) => setC({ ...c, email: v })}
          required
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={c.phone}
          onChange={(v) => setC({ ...c, phone: v })}
          required
          sublabel={`So ${REALTOR.name} can send you matching listings.`}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">When are you hoping to buy?</label>
          <select
            value={c.buyingTimeline}
            onChange={(e) => setC({ ...c, buyingTimeline: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
          >
            <option value="">Select…</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* honeypot — hidden from humans */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={c.company}
          onChange={(e) => setC({ ...c, company: e.target.value })}
          className="hidden"
          aria-hidden
        />

        <label className="flex items-start gap-2.5 pt-1 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={c.consent}
            onChange={(e) => setC({ ...c, consent: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span>
            I agree to be contacted by {REALTOR.name} about my home search. We never sell your information.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--accent)] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Unlocking…" : "Show my full breakdown →"}
        </button>
      </form>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  sublabel,
  name,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  sublabel?: string;
  name?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
      />
      {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
}

/* ------------------------------- Results ------------------------------- */

function Results({
  result,
  inputs,
  personal,
  onRestart,
}: {
  result: AffordabilityResult;
  inputs: Partial<AffordabilityInputs>;
  personal: { firstName: string; buyingTimeline: string };
  onRestart: () => void;
}) {
  const name = personal.firstName?.trim() || "";
  const timeline = personal.buyingTimeline;

  // Client-side price slider: recompute every cost for whatever price the user picks.
  const params: BreakdownParams = {
    downPayment: result.breakdown.downPayment,
    annualRatePct: result.rate,
    taxRatePct: result.propertyTaxRatePct,
    insuranceAnnual: result.insuranceAnnual,
    termYears: inputs.termYears ?? 30,
  };
  const sliderMin = Math.floor(result.priceLow);
  const sliderMax = Math.max(Math.ceil(result.priceHigh), sliderMin + 1000);
  const [price, setPrice] = useState(result.priceLow);
  const bd = breakdownAtPrice(price, params);
  const cash = cashToClose(price, params.downPayment);
  const position =
    price <= result.priceLow * 1.01
      ? "Comfortable"
      : price >= result.priceHigh * 0.99
        ? "Stretch"
        : "Mid-range";

  if (!result.qualified) {
    return (
      <ResultsShell onRestart={onRestart}>
        <SentBanner name={name} timeline={timeline} />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {name ? `${name}, homeownership` : "Homeownership"} is closer than it looks
          </h2>
          <p className="mt-3 text-slate-600">
            Based on what you shared, today's numbers are tight — but that's exactly what {REALTOR.name} helps
            with. A short conversation can map out the income, debt, or down-payment targets that open up your
            options, plus loan programs (like FHA) built for this.
          </p>
          <div className="mt-5">
            <CTA timeline={timeline} />
          </div>
        </div>
        <BasedOn inputs={inputs} />
        <Disclaimer rate={result.rate} baseRate={result.baseRate} />
      </ResultsShell>
    );
  }

  return (
    <ResultsShell onRestart={onRestart}>
      <SentBanner name={name} timeline={timeline} />

      {/* headline range */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          {name ? `${name}, here's what you can afford` : "Your home affordability"}
        </p>
        <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {moneyShort(result.priceLow)} – {moneyShort(result.priceHigh)}
        </p>
        <p className="mt-2 text-slate-500">
          <span className="font-semibold text-slate-700">{money(result.priceLow)}</span> comfortably, up to{" "}
          <span className="font-semibold text-slate-700">{money(result.priceHigh)}</span> at a stretch.
        </p>
      </div>

      {/* interactive monthly breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Estimated monthly payment</h3>
        <p className="mb-5 text-sm text-slate-500">
          Drag to explore any price in your range — every cost updates at your{" "}
          {result.rate.toFixed(2)}% rate.
        </p>

        {/* price slider */}
        <div className="mb-5 rounded-xl bg-slate-50 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              Home price
              <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                {position}
              </span>
            </span>
            <span className="text-2xl font-extrabold text-slate-900">{money(price)}</span>
          </div>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Home price"
            className="w-full cursor-pointer accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>{moneyShort(result.priceLow)} comfortable</span>
            <span>{moneyShort(result.priceHigh)} stretch</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <Row label="Principal & interest" value={money(bd.principalAndInterest)} />
          <Row
            label="Property taxes"
            sub={`${stateName(result.stateCode)} avg · ${result.propertyTaxRatePct.toFixed(2)}% of value`}
            value={money(bd.propertyTax)}
          />
          <Row
            label="Home insurance"
            sub={`${stateName(result.stateCode)} avg · ${money(result.insuranceAnnual)}/yr`}
            value={money(bd.insurance)}
          />
          {bd.pmi > 0 && (
            <Row
              label="Mortgage insurance (PMI)"
              sub="Applies under 20% down"
              value={money(bd.pmi)}
            />
          )}
          <Row label="Total monthly" value={money(bd.totalMonthly)} bold />
        </div>
      </div>

      {/* cash to close — follows the slider */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Cash you'll need to close</h3>
        <p className="mb-4 text-sm text-slate-500">
          At your selected {money(price)} price — the number most buyers get surprised by.
        </p>
        <div className="divide-y divide-slate-100">
          <Row label="Down payment" value={money(params.downPayment)} />
          <Row label="Est. closing costs (~3%)" value={money(cash - params.downPayment)} />
          <Row label="Total cash to close" value={money(cash)} bold />
        </div>
      </div>

      {/* what changes your number */}
      {result.insights.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-bold text-slate-900">What could change your number</h3>
          <p className="mb-3 text-sm text-slate-500">
            Each move shows how much more home you could afford.
          </p>

          {/* personalized: what's limiting this buyer right now */}
          <p className="mb-4 rounded-xl bg-[var(--accent)]/5 px-4 py-3 text-sm leading-relaxed text-slate-600">
            {limitingFactorNote(result, inputs)}
          </p>

          <ul className="space-y-2.5">
            {result.insights.map((i) => (
              <li key={i.label} className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">{i.label}</span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-emerald-600">
                      +{moneyShort(Math.abs(i.priceDelta))}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                      more home
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{i.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* what we based this on */}
      <BasedOn inputs={inputs} />

      {/* CTA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <CTA timeline={timeline} />
      </div>

      <Disclaimer rate={result.rate} baseRate={result.baseRate} />
    </ResultsShell>
  );
}

/**
 * Full-screen, branded "report" shell for the results — so they get a spacious,
 * centered presentation instead of being squeezed into the hero's side column.
 */
function ResultsShell({ onRestart, children }: { onRestart: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="h-8 w-40 overflow-hidden">
            <img
              src="/images/logo.svg"
              alt="SAVISPACES"
              className="h-auto w-40 max-w-none -translate-y-[64px]"
            />
          </div>
          <button
            onClick={onRestart}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ✕ Start over
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:py-10">{children}</div>
    </div>
  );
}

function stateName(code: string): string {
  return US_STATES.find((s) => s.code === code)?.name ?? "Your state";
}

/** Personalized explanation of what's currently capping this buyer's budget. */
function limitingFactorNote(
  result: AffordabilityResult,
  inputs: Partial<AffordabilityInputs>,
): string {
  switch (result.limitingFactor) {
    case "debts":
      return "Right now, your monthly debts are what's holding your budget back — lenders count them against how much you can put toward a home, so paying them down would raise your number the most.";
    case "comfort":
      return `Your budget is set by the ${money(
        inputs.comfortPayment ?? 0,
      )}/mo payment you said you're comfortable with — which is below what you'd qualify for. Nudging that up would lift your range.`;
    case "income":
    default:
      return "Right now, your income is what's setting your budget — lenders cap your housing payment near 28% of it, and your debts aren't the bottleneck. That's why adding to your down payment (or earning a lower rate) moves your number more than paying down debt would.";
  }
}

function Row({
  label,
  value,
  bold,
  sub,
}: {
  label: string;
  value: string;
  bold?: boolean;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className={bold ? "font-semibold text-slate-900" : "text-slate-600"}>
        {label}
        {sub && <span className="mt-0.5 block text-xs font-normal text-slate-400">{sub}</span>}
      </span>
      <span
        className={
          bold
            ? "shrink-0 text-lg font-extrabold text-slate-900"
            : "shrink-0 font-semibold text-slate-800"
        }
      >
        {value}
      </span>
    </div>
  );
}

function timelineLead(t?: string): string | null {
  if (!t) return null;
  if (t === "I'm ready now") return "You said you're ready to buy now —";
  if (t === "Just exploring") return "You're still exploring —";
  return `You're aiming to buy in ${t} —`;
}

function CTA({ timeline }: { timeline?: string }) {
  const lead = timelineLead(timeline);
  return (
    <div className="text-center">
      <h3 className="text-lg font-bold text-slate-900">Ready to make it real?</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
        {lead ? `${lead} ` : "This is an estimate — "}
        {REALTOR.name} can help you get pre-approved and find homes in your range.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {REALTOR.phone.trim() !== "" && (
          <a
            href={`tel:${REALTOR.phone.replace(/[^0-9]/g, "")}`}
            className="rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Call {REALTOR.name.split(" ")[0]}
          </a>
        )}
        <a
          href={`mailto:${REALTOR.email}`}
          className={
            REALTOR.phone.trim() !== ""
              ? "rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              : "rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          }
        >
          {REALTOR.phone.trim() !== "" ? "Email instead" : `Email ${REALTOR.name.split(" ")[0]}`}
        </a>
      </div>
    </div>
  );
}

/** Confirms the lead reached the realtor — personal, and sets the connection expectation. */
function SentBanner({ name, timeline }: { name: string; timeline?: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
      <p className="text-sm font-semibold text-emerald-900">
        ✓ {name ? `${name}, your` : "Your"} personalized estimate has been shared with {REALTOR.name}.
      </p>
      <p className="mt-0.5 text-xs text-emerald-700">
        {timeline && timeline !== "Just exploring"
          ? `They'll reach out personally to help with homes in your range.`
          : `They're here whenever you're ready — no pressure.`}
      </p>
    </div>
  );
}

/** Shows exactly what the estimate is based on — personal + transparent. */
function BasedOn({ inputs }: { inputs: Partial<AffordabilityInputs> }) {
  const creditLabel =
    CREDIT_TIERS.find((t) => t.value === inputs.creditRange)?.label ?? "—";
  const items: { label: string; value: string }[] = [
    { label: "Location", value: stateName(inputs.state ?? "") },
    { label: "Household income", value: `${money(inputs.annualIncome ?? 0)}/yr` },
    { label: "Monthly debts", value: money(inputs.monthlyDebts ?? 0) },
    { label: "Down payment", value: money(inputs.downPayment ?? 0) },
    { label: "Credit range", value: creditLabel },
  ];
  if (inputs.comfortPayment && inputs.comfortPayment > 0) {
    items.push({ label: "Comfortable payment", value: `${money(inputs.comfortPayment)}/mo` });
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-bold text-slate-900">What we based this on</h3>
      <p className="mb-4 text-sm text-slate-500">Your numbers — update anything and recalculate anytime.</p>
      <div className="divide-y divide-slate-100">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between py-2.5">
            <span className="text-slate-600">{it.label}</span>
            <span className="font-semibold text-slate-800">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Disclaimer({ rate, baseRate }: { rate: number; baseRate: number }) {
  return (
    <p className="px-2 pb-2 text-center text-xs leading-relaxed text-slate-400">
      Estimate only — not a loan commitment, pre-approval, or financial advice. Based on a {rate.toFixed(2)}%
      rate (live 30-yr average {baseRate.toFixed(2)}% + your credit tier) and average state taxes/insurance.
      Your actual approval depends on a lender&apos;s full underwriting. See the full disclaimer below.
    </p>
  );
}
