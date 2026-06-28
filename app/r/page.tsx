import type { Metadata } from "next";
import Link from "next/link";
import { REALTOR } from "@/config/realtor";
import { calculateAffordability } from "@/lib/affordability";
import { getBaseRate } from "@/lib/rate";
import { decodeShare } from "@/lib/share";
import { ResultsReport } from "../Calculator";

const accentStyle = { ["--accent" as string]: REALTOR.accent } as React.CSSProperties;
const firstName = REALTOR.name.split(" ")[0];

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { name } = decodeShare(await searchParams);
  const who = name ? `${name}'s` : "A";
  return {
    title: `${who} home affordability estimate · ${REALTOR.brokerage}`,
    description: `See the home price range, monthly payment, and cash-to-close from ${REALTOR.name}'s free affordability calculator.`,
  };
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label={REALTOR.brokerage} className="block">
          <div className="h-8 w-40 overflow-hidden">
            <img
              src="/images/logo.svg"
              alt="SAVISPACES"
              className="h-auto w-40 max-w-none -translate-y-[64px]"
            />
          </div>
        </Link>
        <Link
          href="/"
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Get my own estimate
        </Link>
      </div>
    </header>
  );
}

export default async function SharedResults({ searchParams }: { searchParams: SP }) {
  const { inputs, name } = decodeShare(await searchParams);

  // Invalid / incomplete link.
  if (!inputs.annualIncome) {
    return (
      <main style={accentStyle} className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">This link looks incomplete</h1>
          <p className="mt-3 text-slate-500">
            We couldn&apos;t read the estimate from this link — but you can run your own in under a minute.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Start my free estimate →
          </Link>
        </div>
      </main>
    );
  }

  const baseRate = await getBaseRate();
  const result = calculateAffordability(inputs, baseRate);

  return (
    <main style={accentStyle} className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
            Shared affordability estimate
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {name ? `${name}'s home affordability` : "A home affordability estimate"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Prepared with {REALTOR.name}&apos;s free calculator · {REALTOR.brokerage}
          </p>
        </div>

        <ResultsReport result={result} inputs={inputs} name={name} />

        <div className="rounded-2xl bg-[var(--accent)] p-6 text-center">
          <h2 className="text-lg font-bold text-white">Want your own numbers?</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-white/90">
            Run a free, personalized estimate in under a minute — then connect with {firstName}.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-xl bg-white px-6 py-3 text-base font-semibold text-[var(--accent)] shadow-sm transition hover:bg-white/90"
          >
            Get my free estimate →
          </Link>
        </div>
      </div>
    </main>
  );
}
