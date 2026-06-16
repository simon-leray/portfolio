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

// ─── Mobile fade constants ────────────────────────────────────────────────────
const MOBILE_INTERVAL_MS = 9_000;
const MOBILE_FADE_MS     = 500;

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

// Mobile poster style: ignore CMS line breaks, break aggressively at 3-4 words per line.
function breakMobilePosterLines(text: string, maxWords = 4): string[] {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    lines.push(words.slice(i, i + maxWords).join(" "));
  }
  return lines;
}

// Flatten CMS line breaks, convert inner quotes to ‹ ›, then break aggressively for mobile.
function processMobileQuote(text: string): string[] {
  const flat = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return breakMobilePosterLines(replaceQuotes(flat));
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

  // Mobile fade state
  const [mobileQuote, setMobileQuote]     = useState<string[]>([]);
  const [mobileVisible, setMobileVisible] = useState(true);
  const mobilePoolRef    = useRef<string[]>([]);
  const mobileIdxRef     = useRef(0);
  const mobileTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const mobileFadeRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Mobile fade cycle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!quotes.length) return;
    mobilePoolRef.current = shuffleArray(quotes);
    mobileIdxRef.current  = 0;
    setMobileQuote(processMobileQuote(mobilePoolRef.current[mobileIdxRef.current++]));
    setMobileVisible(true);

    mobileTimerRef.current = setInterval(() => {
      setMobileVisible(false);
      mobileFadeRef.current = setTimeout(() => {
        if (mobileIdxRef.current >= mobilePoolRef.current.length) {
          mobilePoolRef.current = shuffleArray(quotesRef.current);
          mobileIdxRef.current  = 0;
        }
        setMobileQuote(processMobileQuote(mobilePoolRef.current[mobileIdxRef.current++]));
        setMobileVisible(true);
      }, MOBILE_FADE_MS);
    }, MOBILE_INTERVAL_MS);

    return () => {
      if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
      if (mobileFadeRef.current)  clearTimeout(mobileFadeRef.current);
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

      {/* ── Mobile: full bespoke layout (hidden on desktop) ──
            Top zone (quote) / divider / bottom zone (eyebrow, name, tagline, buttons).
            display is controlled entirely via CSS class (see <style jsx>)             */}
      <div
        className="mobile-hero-content absolute inset-0 z-10 flex flex-col"
        style={{ paddingTop: "4rem" }}
      >
        {/* TOP ZONE — quote */}
        <div
          className="flex flex-col justify-start px-6 overflow-hidden"
          style={{ flexBasis: "35%", paddingTop: "1.2rem" }}
        >
          {showQuotes && (
            <>
              <p
                style={{
                  fontFamily:    "var(--font-bebas), sans-serif",
                  fontSize:      "0.6rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color:         "#d0021b",
                  marginBottom:  "0.5rem",
                }}
              >
                Zitat
              </p>
              <p
                className="mobile-quote-text"
                style={{
                  fontFamily: "var(--font-bebas), sans-serif",
                  fontSize:   "clamp(1.6rem, 5.5vw, 2rem)",
                  lineHeight: 1.0,
                  color:      "rgba(255,255,255,0.9)",
                  textAlign:  "left",
                  opacity:    mobileVisible ? 1 : 0,
                  transition: `opacity ${MOBILE_FADE_MS}ms ease`,
                }}
              >
                {mobileQuote.map((line, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {i === 0 ? "«" : ""}{line}{i === mobileQuote.length - 1 ? "»" : ""}
                  </span>
                ))}
              </p>
            </>
          )}
        </div>

        {/* DIVIDER */}
        <div
          style={{
            width:           "100%",
            height:          "1px",
            backgroundColor: "#d0021b",
            marginTop:       "1rem",
            marginBottom:    "1rem",
          }}
        />

        {/* BOTTOM ZONE — eyebrow, name, tagline, buttons */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-10">
          {tagline && (
            <p
              style={{
                fontFamily:    "var(--font-bebas), sans-serif",
                fontSize:      "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color:         "#d0021b",
                marginBottom:  "0.75rem",
              }}
            >
              {tagline}
            </p>
          )}
          <h1
            style={{
              fontFamily:    "var(--font-bebas), sans-serif",
              fontSize:      "clamp(4rem, 18vw, 5.5rem)",
              lineHeight:    0.88,
              letterSpacing: "0.02em",
              color:         "white",
            }}
          >
            SIMON<br />LERAY<span style={{ color: "#d0021b" }}>.</span>
          </h1>
          {subtitle && (
            <p
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontStyle:  "italic",
                fontSize:   "0.9rem",
                color:      "rgba(255,255,255,0.6)",
                maxWidth:   "85vw",
                marginTop:  "1rem",
              }}
            >
              {subtitle}
            </p>
          )}
          <div className="flex gap-3 mt-8">
            <Link
              href="/texte"
              className="bg-red text-paper tracking-widest uppercase px-5 py-3 hover:bg-paper hover:text-ink transition-colors duration-200"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "0.7rem" }}
            >
              Artikel lesen
            </Link>
            <Link
              href="/kontakt"
              className="border border-paper/30 text-paper tracking-widest uppercase px-5 py-3 hover:bg-paper hover:text-ink transition-colors duration-200"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "0.7rem" }}
            >
              Kontakt
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
      <div className="absolute bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-2 text-paper/30 animate-bounce motion-reduce:animate-none text-center">
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
        /* Mobile: show bespoke layout + fade quote, hide drift layer + desktop content */
        .mobile-hero-content  { display: flex; }
        .desktop-hero-content { display: none; }
        .desktop-quotes       { display: none; }

        /* Desktop: hide mobile layout, show drift layer + desktop content */
        @media (min-width: 768px) {
          .mobile-hero-content  { display: none; }
          .desktop-hero-content { display: block; }
          .desktop-quotes       { display: block; }
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
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up   { animation: none; }
          .drift             { animation: none; opacity: 0; }
          .mobile-quote-text { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
