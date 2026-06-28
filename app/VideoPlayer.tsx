"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typing for the YouTube IFrame API (avoids pulling @types/youtube). */
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: Record<string, number> };
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (s: number, allow: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
}

let apiPromise: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

function fmt(t: number): string {
  const sec = Number.isFinite(t) && t > 0 ? t : 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Whitelabeled YouTube player: native chrome hidden, custom brand controls. */
export default function VideoPlayer({ videoId, accent }: { videoId: string; accent: string }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [posterOk, setPosterOk] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    loadApi().then(() => {
      if (cancelled || !holderRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(holderRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          fs: 0,
          disablekb: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => setDuration(e.target.getDuration()),
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            const S = window.YT!.PlayerState;
            if (e.data === S.PLAYING) {
              setPlaying(true);
              setStarted(true);
              setDuration(e.target.getDuration());
            } else if (e.data === S.PAUSED || e.data === S.ENDED) {
              setPlaying(false);
            }
          },
        },
      });
    });
    const tick = () => {
      const p = playerRef.current;
      if (p?.getCurrentTime) {
        setCurrent(p.getCurrentTime());
        const d = p.getDuration();
        if (d) setDuration(d);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
    };
  }, [videoId]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = playerRef.current;
    if (!p || !duration) return;
    const t = (Number(e.target.value) / 100) * duration;
    p.seekTo(t, true);
    setCurrent(t);
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const pct = duration ? (current / duration) * 100 : 0;
  const poster = posterOk
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-black/5"
    >
      {/* YouTube iframe — no pointer events, so its title/branding never surfaces on hover */}
      <div className="pointer-events-none absolute inset-0">
        <div ref={holderRef} className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full" />
      </div>

      {/* click layer to pause during playback — keeps every click off the YouTube
          iframe so its hover UI never appears */}
      <button
        type="button"
        aria-label="Pause"
        onClick={toggle}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer"
      />

      {/* Opaque cover whenever NOT playing. YouTube shows its title, control bar,
          logo, and end-screen suggestions on pause/stop regardless of embed params,
          so we simply cover the whole player until it's playing again. */}
      {!playing && (
        <button
          type="button"
          aria-label="Play"
          onClick={toggle}
          className="absolute inset-0 z-30 flex h-full w-full cursor-pointer items-center justify-center"
        >
          {started ? (
            <span className="absolute inset-0 bg-slate-950" />
          ) : (
            <>
              <img
                src={poster}
                alt=""
                onError={() => setPosterOk(false)}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-black/30" />
            </>
          )}
          <span
            className="relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition group-hover:scale-105"
            style={{ background: accent }}
          >
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      {/* custom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 z-40 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 transition-opacity ${
          playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
      >
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="shrink-0 text-white">
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={pct}
          onChange={onSeek}
          aria-label="Seek"
          className="h-1.5 flex-1 cursor-pointer"
          style={{ accentColor: accent }}
        />

        <span className="shrink-0 text-xs tabular-nums text-white/90">
          {fmt(current)} / {fmt(duration)}
        </span>

        <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="shrink-0 text-white">
          {muted ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M4 9v6h4l5 5V4L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" opacity=".4" />
              <path d="M19 5 5 19" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M4 9v6h4l5 5V4L8 9H4zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
            </svg>
          )}
        </button>

        <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" className="shrink-0 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M7 7h3V5H5v5h2V7zm10 0v3h2V5h-5v2h3zM7 17v-3H5v5h5v-2H7zm10 0h-3v2h5v-5h-2v3z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
