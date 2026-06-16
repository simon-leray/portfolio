"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { replaceQuotes } from "@/lib/quotes";

// ─── Desktop drift constants ──────────────────────────────────────────────────
const N_SLOTS            = 9;
const TOP_RESERVE        = 8;
const BOTTOM_RESERVE     = 20;
const USABLE             = 100 - TOP_RESERVE - BOTTOM_RESERVE;
const ENTRY_INTERVAL_MIN = 8_000;
const ENTRY_INTERVAL_MAX = 12_000;
const INITIAL_COUNT      = 5;

// ─── Mobile typewriter constants ──────────────────────────────────────────────
const TYPE_SPEED_MS   = 35;   // ms per character while typing
const DELETE_SPEED_MS = 18;   // ms per character while deleting (faster)
const PAUSE_FULL_MS   = 2_500; // pause once fully typed
const PAUSE_EMPTY_MS  = 500;   // pause once fully deleted, before next quote

interface ActiveQuote {
  id: number;
  slot: number;
  duration: number;
  delay: number;
  lines: string[];
  fontSize: string;
  sizeClass: "qs-short" | "qs-medium" | "qs-long";
}

interface Props {
  tagline?: string;
  subtitle?: string;
  quotes?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function quoteFontSize(maxLineLen: number): string {
  if (maxLineLen < 40)  return "clamp(2.5rem, 5vw, 4rem)";
  if (maxLineLen < 70)  return "clamp(1.6rem, 3vw, 2.6rem)";
  if (maxLineLen < 100) return "clamp(1.3rem, 2.5vw, 2.1rem)";
  return "clamp(1.1rem, 2.2vw, 1.8rem)";
}

function quoteSizeClass(lines: string[]): "qs-short" | "qs-medium" | "qs-long" {
  const total = lines.join(" ").length;
  if (total < 50)  return "qs-short";
  if (total < 100) return "qs-medium";
  return "qs-long";
}

function quoteLines(text: string): string[] {
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  return lines.length ? lines : [text];
}

// Flatten CMS line breaks and convert inner quotes to ‹ ›; lets CSS wrap naturally.
function processMobileQuote(text: string): string {
  const flat = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return replaceQuotes(flat);
}

function slotToPercent(slot: number): number {
  const slotH = USABLE / N_SLOTS;
  return TOP_RESERVE + slot * slotH + slotH / 2;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomSpreadPositions(count: number, maxVal = 0.9, minGap = 0.15): number[] {
  const slack = maxVal - (count - 1) * minGap;
  if (slack <= 0) return Array.from({ length: count }, (_, i) => Math.min(i * minGap, maxVal));
  const raw = Array.from({ length: count }, () => Math.random() * slack).sort((a, b) => a - b);
  return raw.map((v, i) => v + i * minGap);
}

function randomDuration(): number {
  if (Math.random() < 0.7) return 45 + Math.random() * 15;
  return 75 + Math.random() * 25;
}

let nextId = 0;

// ─── Component ────────────────────────────────────────────────────────────────

export function Hero({ tagline, subtitle, quotes = [] }: Props) {
  const ghostRef = useRef<HTMLDivElement>(null);

  // Desktop drift state
  const [activeQuotes, setActiveQuotes] = useState<ActiveQuote[]>([]);
  const activeRef    = useRef<ActiveQuote[]>([]);
  const quotesRef    = useRef(quotes);
  const poolRef      = useRef<string[]>([]);
  const poolIdxRef   = useRef(0);
  const mountedRef   = useRef(false);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile typewriter state
  const [typedText, setTypedText] = useState("");
  const typedQuoteRef    = useRef("");
  const typedIdxRef      = useRef(0);
  const typedPoolRef     = useRef<string[]>([]);
  const typedPoolIdxRef  = useRef(0);
  const typedTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typedActiveRef   = useRef(false);

  useEffect(() => { quotesRef.current = quotes; }, [quotes]);
  useEffect(() => { activeRef.current = activeQuotes; }, [activeQuotes]);

  // LERAY ghost — fallback when no quotes provided
  useEffect(() => {
    if (quotes.length > 0) return;
    const el = ghostRef.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    function tick() {
      x += 0.03;
      el!.style.transform = `translateX(${Math.sin(x) * 40}px) translateY(${Math.cos(x * 0.7) * 15}px)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [quotes.length]);

  // ── Mobile typewriter cycle ─────────────────────────────────────────────────
  function getNextTypedQuote(): string {
    if (typedPoolIdxRef.current >= typedPoolRef.current.length) {
      typedPoolRef.current = shuffleArray(quotesRef.current);
      typedPoolIdxRef.current = 0;
    }
    return processMobileQuote(typedPoolRef.current[typedPoolIdxRef.current++]);
  }

  function runPauseEmpty() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      typedQuoteRef.current = getNextTypedQuote();
      typedIdxRef.current = 0;
      setTypedText("");
      runTyping();
    }, PAUSE_EMPTY_MS);
  }

  function runTyping() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      typedIdxRef.current++;
      setTypedText(typedQuoteRef.current.slice(0, typedIdxRef.current));
      if (typedIdxRef.current >= typedQuoteRef.current.length) {
        runPauseFull();
      } else {
        runTyping();
      }
    }, TYPE_SPEED_MS);
  }

  function runPauseFull() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      runDeleting();
    }, PAUSE_FULL_MS);
  }

  function runDeleting() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      typedIdxRef.current--;
      setTypedText(typedQuoteRef.current.slice(0, typedIdxRef.current));
      if (typedIdxRef.current <= 0) {
        runPauseEmpty();
      } else {
        runDeleting();
      }
    }, DELETE_SPEED_MS);
  }

  useEffect(() => {
    if (!quotes.length) return;
    typedPoolRef.current    = shuffleArray(quotes);
    typedPoolIdxRef.current = 0;
    typedActiveRef.current  = true;
    runPauseEmpty(); // initial 0.5s cursor-only blink before first quote types in

    return () => {
      typedActiveRef.current = false;
      if (typedTimerRef.current) clearTimeout(typedTimerRef.current);
    };
  }, [quotes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Desktop drift pool ──────────────────────────────────────────────────────
  function getNextText(): string {
    if (poolIdxRef.current >= poolRef.current.length) {
      poolRef.current = shuffleArray(quotesRef.current);
      poolIdxRef.current = 0;
    }
    return poolRef.current[poolIdxRef.current++];
  }

  function spawnInitialQuotes() {
    const count     = Math.min(INITIAL_COUNT, quotesRef.current.length);
    const positions = randomSpreadPositions(count, 0.9, 0.15);
    const usedSlots = new Set<number>();
    const batch: ActiveQuote[] = [];
    for (let i = 0; i < count; i++) {
      const free = Array.from({ length: N_SLOTS }, (_, s) => s).filter(s => !usedSlots.has(s));
      if (!free.length) break;
      const slot     = free[Math.floor(Math.random() * free.length)];
      usedSlots.add(slot);
      const duration = randomDuration();
      const delay    = -(positions[i] * duration);
      const text     = getNextText();
      const lines    = quoteLines(text);
      const maxLen   = Math.max(...lines.map(l => l.length));
      batch.push({ id: nextId++, slot, duration, delay, lines, fontSize: quoteFontSize(maxLen), sizeClass: quoteSizeClass(lines) });
    }
    setActiveQuotes(batch);
    activeRef.current = batch;
  }

  function trySpawnQuote() {
    if (!mountedRef.current) return;
    const occupied = new Set(activeRef.current.map(q => q.slot));
    const free     = Array.from({ length: N_SLOTS }, (_, i) => i).filter(s => !occupied.has(s));
    if (!free.length) { retryRef.current = setTimeout(trySpawnQuote, 1500); return; }
    const slot     = free[Math.floor(Math.random() * free.length)];
    const text     = getNextText();
    const lines    = quoteLines(text);
    const maxLen   = Math.max(...lines.map(l => l.length));
    const duration = randomDuration();
    const q: ActiveQuote = { id: nextId++, slot, duration, delay: 0, lines, fontSize: quoteFontSize(maxLen), sizeClass: quoteSizeClass(lines) };
    setActiveQuotes(prev => { const next = [...prev, q]; activeRef.current = next; return next; });
  }

  function scheduleNext() {
    const delay = ENTRY_INTERVAL_MIN + Math.random() * (ENTRY_INTERVAL_MAX - ENTRY_INTERVAL_MIN);
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      trySpawnQuote();
      scheduleNext();
    }, delay);
  }

  function onQuoteExit(id: number) {
    if (!mountedRef.current) return;
    setActiveQuotes(prev => { const next = prev.filter(q => q.id !== id); activeRef.current = next; return next; });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!quotes.length) return;
    mountedRef.current = true;
    poolRef.current    = shuffleArray(quotes);
    poolIdxRef.current = 0;
    spawnInitialQuotes();
    scheduleNext();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []); // intentional: run once on mount

  const showQuotes = quotes.length > 0;

  return (
    <section className="relative min-h-screen bg-ink text-paper flex flex-col justify-center overflow-hidden pt-16">

      {/* ── Mobile: typewriter concept (hidden on desktop) ──
            Fixed header / typewriter quote filling the middle / minimal bottom links.
            display is controlled entirely via CSS class (see <style jsx>)            */}
      <div
        className="mobile-hero-content absolute inset-0 z-10"
        style={{ paddingTop: "4rem" }}
      >
        {/* Vertical red stripe — runs the full height of the hero */}
        <div
          aria-hidden
          style={{
            position:        "absolute",
            left:             "1.8rem",
            top:              0,
            bottom:           0,
            width:            "3px",
            backgroundColor:  "#d0021b",
          }}
        />

        {/* All content sits to the right of the stripe */}
        <div
          className="flex flex-col justify-between"
          style={{ height: "100%", paddingLeft: "3rem" }}
        >
          {/* TOP — anchored at top */}
          <div style={{ paddingTop: "1rem" }}>
            <h1
              style={{
                fontFamily: "var(--font-bebas), sans-serif",
                fontSize:   "20vw",
                lineHeight: 0.85,
                color:      "white",
                margin:     0,
              }}
            >
              SIMON<br />LERAY<span style={{ color: "#d0021b" }}>.</span>
            </h1>
            <p
              style={{
                fontFamily:    "var(--font-inter), sans-serif",
                fontSize:      "0.55rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color:         "#d0021b",
                marginTop:     "0.5rem",
              }}
            >
              Journalist · Biel/Bienne
            </p>
          </div>

          {/* MIDDLE — typewriter quote, vertically centered */}
          {showQuotes && (
            <div className="flex-1 flex items-center pr-6">
              <p
                style={{
                  fontFamily: "var(--font-playfair), serif",
                  fontStyle:  "italic",
                  fontSize:   "1.05rem",
                  color:      "white",
                  opacity:    0.85,
                  maxWidth:   "80vw",
                }}
              >
                {typedText}
                <span className="typewriter-cursor" style={{ color: "#d0021b" }}>|</span>
              </p>
            </div>
          )}

          {/* BOTTOM — minimal text links */}
          <div style={{ paddingBottom: "2.5rem", display: "flex", gap: "2rem" }}>
            <Link
              href="/texte"
              style={{
                fontFamily:    "var(--font-inter), sans-serif",
                fontSize:      "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color:         "white",
                opacity:       0.6,
              }}
            >
              Texte →
            </Link>
            <Link
              href="/kontakt"
              style={{
                fontFamily:    "var(--font-inter), sans-serif",
                fontSize:      "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color:         "white",
                opacity:       0.6,
              }}
            >
              Kontakt →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Desktop: drifting quotes (hidden on mobile) ── */}
      {showQuotes ? (
        <div
          aria-hidden
          className="desktop-quotes absolute inset-0 pointer-events-none select-none quotes-bg"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          {activeQuotes.map(q => (
            <div
              key={q.id}
              className="absolute w-full"
              style={{ top: `${slotToPercent(q.slot)}%`, transform: "translateY(-50%)" }}
            >
              <div
                className={`drift ${q.sizeClass}`}
                style={{
                  fontSize:          q.fontSize,
                  animationDuration: `${q.duration}s`,
                  animationDelay:    `${q.delay}s`,
                }}
                onAnimationEnd={() => onQuoteExit(q.id)}
              >
                {q.lines.map((line, j) => (
                  <span key={j} style={{ display: "block" }}>{line}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={ghostRef}
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none motion-reduce:transform-none"
          style={{ willChange: "transform" }}
        >
          <span
            className="text-[20vw] md:text-[22vw] font-bold text-paper/[0.03] whitespace-nowrap leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.1em" }}
          >
            LERAY
          </span>
        </div>
      )}

      {/* Foreground content — desktop only */}
      <div className="desktop-hero-content relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="animate-fade-up">
          {tagline && (
            <p className="text-red text-xs tracking-widest uppercase mb-8">{tagline}</p>
          )}
          <h1
            className="text-[clamp(3.5rem,12vw,9rem)] leading-none text-paper mb-8"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            Simon<br />Leray
          </h1>
          {subtitle && (
            <p
              className="text-paper/60 text-lg md:text-xl max-w-lg leading-relaxed mb-12"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/texte"
              className="bg-red text-paper text-xs tracking-widest uppercase px-8 py-4 hover:bg-paper hover:text-ink transition-colors duration-200"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "0.9rem" }}
            >
              Artikel lesen
            </Link>
            <Link
              href="/kontakt"
              className="border border-paper/30 text-paper text-xs tracking-widest uppercase px-8 py-4 hover:bg-paper hover:text-ink transition-colors duration-200"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "0.9rem" }}
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="scroll-hint absolute bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-2 text-paper/30 animate-bounce motion-reduce:animate-none text-center">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
          <path d="M6 0v18M1 13l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <style jsx global>{`
        @keyframes driftLeft {
          from { transform: translateX(110vw); }
          to   { transform: translateX(calc(-100% - 10vw)); }
        }
      `}</style>

      <style jsx>{`
        /* Mobile: show bespoke layout + fade quote, hide drift layer + desktop content + scroll hint */
        .mobile-hero-content  { display: flex; }
        .desktop-hero-content { display: none; }
        .desktop-quotes       { display: none; }
        .scroll-hint           { display: none; }

        /* Desktop: hide mobile layout, show drift layer + desktop content + scroll hint */
        @media (min-width: 768px) {
          .mobile-hero-content  { display: none; }
          .desktop-hero-content { display: block; }
          .desktop-quotes       { display: block; }
          .scroll-hint           { display: flex; }
        }

        .drift {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          font-weight: 400;
          line-height: 1.3;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.14);
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
          animation: driftLeft linear forwards;
          will-change: transform;
        }
        .quotes-bg {
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        @media (min-width: 768px) {
          .drift { color: rgba(255, 255, 255, 0.24); }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease forwards;
        }
        @keyframes cursorBlink {
          0%, 50%  { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .typewriter-cursor {
          animation: cursorBlink 1s steps(1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up      { animation: none; }
          .drift                { animation: none; opacity: 0; }
          .typewriter-cursor    { animation: none; opacity: 1; }
        }
      `}</style>
    </section>
  );
}
