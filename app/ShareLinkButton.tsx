"use client";

import { useState } from "react";

/** Shares the current page URL (native share sheet, or copy-to-clipboard fallback). */
export default function ShareLinkButton() {
  const [copied, setCopied] = useState(false);
  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "My home affordability", url });
        return;
      }
    } catch {
      /* share cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* noop */
    }
  };
  return (
    <button
      type="button"
      onClick={onShare}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--accent)]/40 bg-white px-4 py-3 text-sm font-semibold text-[var(--accent)] shadow-sm transition hover:bg-[var(--accent)]/5"
    >
      {copied ? (
        "✓ Link copied — share it anywhere"
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M18 16.1a3 3 0 0 0-2.4 1.2l-6.1-3.5a3 3 0 0 0 0-1.6l6.1-3.5a3 3 0 1 0-1-1.7L8.4 10.6a3 3 0 1 0 0 4.8l6.2 3.6a3 3 0 1 0 3.4-2.9z" />
          </svg>
          Share these results
        </>
      )}
    </button>
  );
}
