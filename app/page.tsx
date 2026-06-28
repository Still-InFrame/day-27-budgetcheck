import { legalDisclaimer } from "@/config/legal";
import { REALTOR } from "@/config/realtor";
import { DATA_SOURCES, DATA_UPDATED, METHODOLOGY } from "@/config/sources";
import Calculator from "./Calculator";

const accentStyle = { ["--accent" as string]: REALTOR.accent } as React.CSSProperties;
const firstName = REALTOR.name.split(" ")[0];
const LIGHT_GOLD = "#d8bd8a"; // light gold for accents over dark backgrounds
const YT_ID = "IowDeZXw9G0";

export default function Home() {
  return (
    <main style={accentStyle} className="bg-white text-slate-900">
      <Nav />
      <Hero />
      <Highlights />
      <HowItWorks />
      <WhyBuyers />
      <VideoSection />
      <AboutAgent />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* --------------------------------- Nav --------------------------------- */

/** Crops the square SAVISPACES logo down to its horizontal wordmark band. */
function NavLogo() {
  return (
    <a href="#calculator" aria-label={`${REALTOR.name} — ${REALTOR.brokerage}`} className="block">
      <div className="h-9 w-44 overflow-hidden">
        <img
          src="/images/logo.svg"
          alt="SAVISPACES"
          className="h-auto w-44 max-w-none -translate-y-[70px]"
        />
      </div>
    </a>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLogo />
        <div className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
          <a href="#how" className="hover:text-slate-900">How it works</a>
          <a href="#about" className="hover:text-slate-900">About {firstName}</a>
        </div>
        <a
          href="#calculator"
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Get my estimate
        </a>
      </nav>
    </header>
  );
}

/* --------------------------------- Hero -------------------------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950">
      <div className="absolute inset-x-0 top-0 h-[680px]">
        <img
          src="/images/hero-home.png"
          alt="A beautiful modern home at golden hour"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-950" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="text-white lg:pt-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: LIGHT_GOLD }}>
              {REALTOR.name} · {REALTOR.brokerage}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Know exactly how much home you can afford.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-200">
              A personalized price range in under a minute — using today's live mortgage rates and your
              state's real costs. No spam, no guesswork.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
              <Trust>Instant results</Trust>
              <Trust>Live mortgage rates</Trust>
              <Trust>100% free</Trust>
            </div>
            <p className="mt-6 text-sm text-slate-400 lg:hidden">
              Start below — it only takes a minute ↓
            </p>
          </div>

          <div id="calculator" className="scroll-mt-24">
            <Calculator />
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <CheckIcon className="h-4 w-4" style={{ color: LIGHT_GOLD }} />
      {children}
    </span>
  );
}

/* ------------------------------ Highlights ----------------------------- */

function Highlights() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
        {REALTOR.highlights.map((it) => (
          <div key={it.value} className="text-center">
            <p className="text-lg font-extrabold text-slate-900 sm:text-xl">{it.value}</p>
            <p className="mt-1 text-sm text-slate-500">{it.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- How it works ---------------------------- */

function HowItWorks() {
  const steps = [
    {
      title: "Tell us your numbers",
      body: "Income, monthly debts, and what you've saved. Six quick questions — no account, no credit pull.",
    },
    {
      title: "See your real range",
      body: "An instant, honest breakdown: your price range, monthly payment, and the cash you'll need to close.",
    },
    {
      title: `Connect with ${firstName}`,
      body: `Get pre-approved and start touring homes in your budget — with an agent who knows ${REALTOR.area}.`,
    },
  ];
  return (
    <section id="how" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            From “can I afford it?” to keys in hand
          </h2>
          <p className="mt-3 text-lg text-slate-500">Three simple steps. The first one takes 60 seconds.</p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-lg font-extrabold text-[var(--accent)]">
                {i + 1}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Why buyers ----------------------------- */

function WhyBuyers() {
  const points = [
    "A real monthly breakdown — principal, interest, taxes, insurance, and PMI",
    "Your cash-to-close, so closing day never surprises you",
    "Today's live Freddie Mac mortgage rates, refreshed weekly",
    "Personalized to your state's property taxes and your credit",
    "An interactive slider to explore every price in your range",
  ];
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            More than a number — a real plan.
          </h2>
          <p className="mt-3 text-lg text-slate-500">
            Most calculators spit out one scary figure. This one shows you the whole picture, tailored to you.
          </p>
          <ul className="mt-7 space-y-3.5">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
                <span className="text-slate-700">{p}</span>
              </li>
            ))}
          </ul>
          <a
            href="#calculator"
            className="mt-8 inline-flex rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Try it now →
          </a>
        </div>
        <div className="order-1 lg:order-2">
          <img
            src="/images/keys.png"
            alt="A happy couple holding the keys to their new home"
            className="w-full rounded-3xl object-cover shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Video ---------------------------------- */

function VideoSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          Get to know {firstName}
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          A different kind of real estate experience
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-500">
          A quick look at who {firstName} is and how he works with buyers.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${YT_ID}`}
              title={`Meet ${REALTOR.name}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ About agent ---------------------------- */

function AboutAgent() {
  const hasPhone = REALTOR.phone.trim() !== "";
  return (
    <section id="about" className="scroll-mt-20 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 lg:grid-cols-[0.8fr_1fr]">
        <div className="lg:sticky lg:top-24">
          <img
            src="/images/agent.jpg"
            alt={`${REALTOR.name}, real estate agent`}
            className="mx-auto w-full max-w-sm rounded-3xl bg-white object-cover shadow-xl"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
            Meet your agent
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {REALTOR.name}
          </h2>
          <p className="mt-1 text-lg font-medium text-slate-500">
            {REALTOR.brokerage} · {REALTOR.tagline}
          </p>
          <div className="mt-5 space-y-4 leading-relaxed text-slate-600">
            {REALTOR.bio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {hasPhone && (
              <a
                href={`tel:${REALTOR.phone.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Call {firstName}
              </a>
            )}
            <a
              href={`mailto:${REALTOR.email}`}
              className={
                hasPhone
                  ? "inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-white"
                  : "inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
              }
            >
              Email {firstName}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA ------------------------------ */

function FinalCta() {
  return (
    <section className="bg-[var(--accent)]">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to find your number?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
          See what you can afford in under a minute — then let {firstName} help you make it real.
        </p>
        <a
          href="#calculator"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-[var(--accent)] shadow-lg transition hover:bg-white/90"
        >
          Get my free estimate →
        </a>
      </div>
    </section>
  );
}

/* -------------------------------- Footer ------------------------------- */

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-extrabold text-white">{REALTOR.name}</p>
            <p className="text-sm font-medium" style={{ color: LIGHT_GOLD }}>
              {REALTOR.brokerage}
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm sm:items-end">
            {REALTOR.phone.trim() !== "" && (
              <a href={`tel:${REALTOR.phone.replace(/[^0-9]/g, "")}`} className="hover:text-white">
                Mobile: {REALTOR.phone}
              </a>
            )}
            <a href={`mailto:${REALTOR.email}`} className="hover:text-white">
              {REALTOR.email}
            </a>
            {REALTOR.license.trim() !== "" && (
              <span className="text-slate-400">License #: {REALTOR.license}</span>
            )}
          </div>
        </div>

        {/* How it works & sources */}
        <details className="group mt-10 rounded-xl border border-slate-700 bg-slate-800/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-200 hover:text-white">
            <span>How this is calculated &amp; where the data comes from</span>
            <span className="text-slate-400 transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="space-y-5 border-t border-slate-700 px-4 py-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                How we calculate your range
              </h3>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-400">
                {METHODOLOGY.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Our data sources</h3>
              <ul className="mt-2 space-y-2.5">
                {DATA_SOURCES.map((s) => (
                  <li key={s.label} className="text-xs leading-relaxed">
                    <span className="font-semibold text-slate-200">{s.label}:</span>{" "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-slate-600 underline-offset-2 hover:decoration-current"
                      style={{ color: LIGHT_GOLD }}
                    >
                      {s.source}
                    </a>
                    <span className="text-slate-500"> · {s.asOf}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-slate-500">
                Reference tables last reviewed {DATA_UPDATED}. The mortgage rate updates automatically each
                week; tax, insurance, and credit figures are state and national averages.
              </p>
            </div>
          </div>
        </details>

        {/* Legal disclaimer */}
        <div className="mt-6 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Important disclaimer</h2>
          {legalDisclaimer(REALTOR).map((para, i) => (
            <p key={i} className="text-[11px] leading-relaxed text-slate-500">
              {para}
            </p>
          ))}
        </div>

        <p className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {REALTOR.brokerage} · Live rates via Freddie Mac (FRED) · Equal Housing Opportunity
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------- Icons -------------------------------- */

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.43-.006l-3.5-3.6a1 1 0 1 1 1.434-1.394l2.785 2.864 6.79-6.882a1 1 0 0 1 1.415-.006Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
