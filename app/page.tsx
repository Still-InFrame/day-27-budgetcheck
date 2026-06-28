import { legalDisclaimer } from "@/config/legal";
import { REALTOR } from "@/config/realtor";
import { DATA_SOURCES, DATA_UPDATED, METHODOLOGY } from "@/config/sources";
import Calculator from "./Calculator";

export default function Home() {
  return (
    <main className="min-h-full bg-slate-50">
      {/* Brand header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: REALTOR.accent }}
          >
            {REALTOR.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">{REALTOR.name}</p>
            <p className="text-xs text-slate-500">{REALTOR.brokerage}</p>
          </div>
        </div>
      </header>

      {/* Hook */}
      <section className="mx-auto max-w-xl px-4 pt-8 text-center sm:pt-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          How much home can you actually afford?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Answer a few quick questions for a real, personalized price range — using today's live mortgage
          rates and your state's taxes. Takes under a minute.
        </p>
      </section>

      <Calculator />

      <footer className="mx-auto max-w-xl px-4 pb-10 pt-2">
        {/* How this works & sources — collapsed by default */}
        <details className="group mb-4 rounded-xl border border-slate-200 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900">
            <span>How this is calculated &amp; where the data comes from</span>
            <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
          </summary>

          <div className="space-y-5 border-t border-slate-100 px-4 py-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                How we calculate your range
              </h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-500">
                {METHODOLOGY.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Our data sources
              </h3>
              <ul className="mt-2 space-y-2.5">
                {DATA_SOURCES.map((s) => (
                  <li key={s.label} className="text-xs leading-relaxed">
                    <span className="font-semibold text-slate-700">{s.label}:</span>{" "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] underline decoration-slate-300 underline-offset-2 hover:decoration-current"
                      style={{ ["--accent" as string]: REALTOR.accent } as React.CSSProperties}
                    >
                      {s.source}
                    </a>
                    <span className="text-slate-400"> · {s.asOf}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-slate-400">
                Reference tables last reviewed {DATA_UPDATED}. The mortgage rate updates
                automatically each week; tax, insurance, and credit figures are state and
                national averages and may not reflect your exact situation.
              </p>
            </div>
          </div>
        </details>

        <div className="rounded-xl border border-slate-200 bg-white/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Important disclaimer
          </h2>
          <div className="mt-2 space-y-2">
            {legalDisclaimer(REALTOR).map((para, i) => (
              <p key={i} className="text-[11px] leading-relaxed text-slate-400">
                {para}
              </p>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          Powered by {REALTOR.brokerage} · Live rates via Freddie Mac (FRED)
        </p>
      </footer>
    </main>
  );
}
