"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { replaceQuotes } from "@/lib/quotes";
import { HeroQuote } from "@/lib/types";

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
const SOURCE_FADE_MS  = 400;   // fade in/out duration for the source line

interface ActiveQuote {
  id: number;
  slot: number;
  duration: number;
  delay: number;
  lines: string[];
  fontSize: string;
  sizeClass: "qs-short" | "qs-medium" | "qs-long";
  sourceLine: string | null;
}

interface Props {
  tagline?: string;
  subtitle?: string;
  quotes?: HeroQuote[];
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

// Flatten CMS line breaks, convert inner quotes to ‹ ›, wrap in outer « » guillemets.
function processMobileQuote(text: string): string {
  const flat = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return `«${replaceQuotes(flat)}»`;
}

function formatSourceLine(source?: string): string | null {
  return source ? `— ${source}` : null;
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

export function Hero({ tagline, subtitle, quotes }: Props) {
  const ghostRef = useRef<HTMLDivElement>(null);

  // Drop any null/undefined entries or items missing a quote — protects against
  // stale/malformed Sanity data (e.g. leftover items from a schema migration).
  const safeQuotes = useMemo(
    () => (quotes ?? []).filter((q): q is HeroQuote => !!q?.quote),
    [quotes]
  );

  // Desktop drift state
  const [activeQuotes, setActiveQuotes] = useState<ActiveQuote[]>([]);
  const activeRef    = useRef<ActiveQuote[]>([]);
  const quotesRef    = useRef(safeQuotes);
  const poolRef      = useRef<HeroQuote[]>([]);
  const poolIdxRef   = useRef(0);
  const mountedRef   = useRef(false);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile typewriter state
  const [typedText, setTypedText]   = useState("");
  const [sourceLine, setSourceLine] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const typedQuoteRef    = useRef("");
  const typedIdxRef      = useRef(0);
  const typedPoolRef     = useRef<HeroQuote[]>([]);
  const typedPoolIdxRef  = useRef(0);
  const typedTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typedActiveRef   = useRef(false);

  useEffect(() => { quotesRef.current = safeQuotes; }, [safeQuotes]);
  useEffect(() => { activeRef.current = activeQuotes; }, [activeQuotes]);

  // LERAY ghost — fallback when no quotes provided
  useEffect(() => {
    if (safeQuotes.length > 0) return;
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
  }, [safeQuotes.length]);

  // ── Mobile typewriter cycle ─────────────────────────────────────────────────
  // Returns null when there are no quotes to show (empty/undefined pool) — callers
  // must check before using the result instead of assuming a quote is always there.
  function getNextTypedQuote(): HeroQuote | null {
    if (quotesRef.current.length === 0) return null;
    if (typedPoolIdxRef.current >= typedPoolRef.current.length) {
      typedPoolRef.current = shuffleArray(quotesRef.current);
      typedPoolIdxRef.current = 0;
    }
    return typedPoolRef.current[typedPoolIdxRef.current++] ?? null;
  }

  function runPauseEmpty() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      const next = getNextTypedQuote();
      if (!next) return; // nothing to show — stop the cycle gracefully
      typedQuoteRef.current = processMobileQuote(next?.quote ?? "");
      typedIdxRef.current = 0;
      setTypedText("");
      setSourceLine(formatSourceLine(next?.source));
      setShowSource(false);
      runTyping();
    }, PAUSE_EMPTY_MS);
  }

  function runTyping() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      typedIdxRef.current++;
      setTypedText(typedQuoteRef.current.slice(0, typedIdxRef.current));
      if (typedIdxRef.current >= typedQuoteRef.current.length) {
        setShowSource(true); // fade in now that typing is complete
        runPauseFull();
      } else {
        runTyping();
      }
    }, TYPE_SPEED_MS);
  }

  function runPauseFull() {
    typedTimerRef.current = setTimeout(() => {
      if (!typedActiveRef.current) return;
      setShowSource(false); // fade out, finishing just before deletion starts
      typedTimerRef.current = setTimeout(() => {
        if (!typedActiveRef.current) return;
        runDeleting();
      }, SOURCE_FADE_MS);
    }, PAUSE_FULL_MS - SOURCE_FADE_MS);
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
    if (!safeQuotes.length) return;
    typedPoolRef.current    = shuffleArray(safeQuotes);
    typedPoolIdxRef.current = 0;
    typedActiveRef.current  = true;
    runPauseEmpty(); // initial 0.5s cursor-only blink before first quote types in

    return () => {
      typedActiveRef.current = false;
      if (typedTimerRef.current) clearTimeout(typedTimerRef.current);
    };
  }, [safeQuotes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Desktop drift pool ──────────────────────────────────────────────────────
  // Returns null when there's no quote to show — callers must check before using it.
  function getNextQuoteObj(): HeroQuote | null {
    if (quotesRef.current.length === 0) return null;
    if (poolIdxRef.current >= poolRef.current.length) {
      poolRef.current = shuffleArray(quotesRef.current);
      poolIdxRef.current = 0;
    }
    return poolRef.current[poolIdxRef.current++] ?? null;
  }

  function spawnInitialQuotes() {
    const count     = Math.min(INITIAL_COUNT, quotesRef.current.length);
    const positions = randomSpreadPositions(count, 0.9, 0.15);
    const usedSlots = new Set<number>();
    const batch: ActiveQuote[] = [];
    for (let i = 0; i < count; i++) {
      const free = Array.from({ length: N_SLOTS }, (_, s) => s).filter(s => !usedSlots.has(s));
      if (!free.length) break;
      const next = getNextQuoteObj();
      if (!next?.quote) break; // no quotes available
      const slot     = free[Math.floor(Math.random() * free.length)];
      usedSlots.add(slot);
      const duration = randomDuration();
      const delay    = -(positions[i] * duration);
      const lines    = quoteLines(next.quote);
      const maxLen   = Math.max(...lines.map(l => l.length));
      batch.push({ id: nextId++, slot, duration, delay, lines, fontSize: quoteFontSize(maxLen), sizeClass: quoteSizeClass(lines), sourceLine: formatSourceLine(next.source) });
    }
    setActiveQuotes(batch);
    activeRef.current = batch;
  }

  function trySpawnQuote() {
    if (!mountedRef.current) return;
    const occupied = new Set(activeRef.current.map(q => q.slot));
    const free     = Array.from({ length: N_SLOTS }, (_, i) => i).filter(s => !occupied.has(s));
    if (!free.length) { retryRef.current = setTimeout(trySpawnQuote, 1500); return; }
    const next = getNextQuoteObj();
    if (!next?.quote) return; // no quotes available
    const slot     = free[Math.floor(Math.random() * free.length)];
    const lines    = quoteLines(next.quote);
    const maxLen   = Math.max(...lines.map(l => l.length));
    const duration = randomDuration();
    const q: ActiveQuote = { id: nextId++, slot, duration, delay: 0, lines, fontSize: quoteFontSize(maxLen), sizeClass: quoteSizeClass(lines), sourceLine: formatSourceLine(next.source) };
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
    if (!safeQuotes.length) return;
    mountedRef.current = true;
    poolRef.current    = shuffleArray(safeQuotes);
    poolIdxRef.current = 0;
    spawnInitialQuotes();
    scheduleNext();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []); // intentional: run once on mount

  const showQuotes = safeQuotes.length > 0;

  return (
    <section
      className="hero-section relative min-h-screen bg-ink text-paper flex flex-col justify-center overflow-hidden pt-16"
      style={{ backgroundColor: "#000000" }}
    >

      {/* Red circle — no blend mode on the circle itself; the inversion lives on the
            text (see below). difference(X, X) = black, so text colored the SAME red
            as this circle inverts to clean black wherever it overlaps the circle, and
            reads as plain red against the black background everywhere else. A second
            "overlay" layer can't work here: a full-area blend above the text would
            invert the whole circle (not just the text), and one below the text never
            reaches it, since opaque text painted later simply covers it. Positioned
            against the section (not the content wrapper) so quote line-count changes
            can't move or resize it.                                                 */}
      <div
        className="mobile-bg-circle"
        aria-hidden
        style={{
          position:        "absolute",
          top:              "50%",
          left:             "50%",
          width:            "110vw",
          height:           "110vw",
          borderRadius:     "50%",
          backgroundColor:  "#d0021b",
          zIndex:           2,
          pointerEvents:    "none",
        }}
      />

      {/* ── Mobile: typewriter concept (hidden on desktop) ──
            Fills the full 100dvh section; three zones spread by justify-content: space-between.
            display is controlled entirely via CSS class (see <style jsx>)                       */}
      <div
        className="mobile-hero-content"
        style={{
          position:       "absolute",
          inset:          0,
          flexDirection:  "column",
          justifyContent: "space-between",
          overflow:       "visible",
        }}
      >
        {/* TOP — name, immediately below nav.
              NOTE: this wrapper must stay position:static (no z-index) — giving it its
              own stacking context would wall off the children's mix-blend-mode from the
              circle, which lives in a sibling subtree. Only the leaf text gets z-index. */}
        <div style={{ paddingTop: "5rem", paddingLeft: "1.2rem", paddingRight: "1.2rem", overflow: "visible" }}>
          <h1
            style={{
              fontFamily:   "var(--font-bebas), sans-serif",
              fontSize:     "28vw",
              lineHeight:   0.82,
              color:        "#d0021b",
              margin:       0,
              position:     "relative",
              zIndex:       3,
              mixBlendMode: "difference",
            }}
          >
            SIMON<br />LERAY<span style={{ color: "#d0021b" }}>.</span>
          </h1>
          <p
            style={{
              fontFamily:    "var(--font-inter), sans-serif",
              fontSize:      "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color:         "#d0021b",
              marginTop:     "0.4rem",
              position:      "relative",
              zIndex:        3,
              mixBlendMode:  "difference",
            }}
          >
            Journalist · Biel/Bienne
          </p>
        </div>

        {/* MIDDLE — typewriter quote.
              Fixed height (~4 lines) + flex-start anchors the text to the top of the
              box, so new lines extend downward instead of the existing text shifting
              up as the flex space-between layout would otherwise force.            */}
        {showQuotes && (
          <div
            style={{
              paddingLeft:  "1.2rem",
              paddingRight: "1.2rem",
              marginTop:    "1.1rem",
              marginBottom: "2.5rem",
              height:       "7.5rem",
              display:      "flex",
              flexDirection: "column",
              alignItems:   "flex-start",
              overflow:     "visible",
            }}
          >
            <p
              style={{
                fontFamily:   "var(--font-playfair), serif",
                fontStyle:    "italic",
                fontSize:     "1.3rem",
                lineHeight:   1.4,
                color:        "#d0021b",
                maxWidth:     "80vw",
                margin:       0,
                position:     "relative",
                zIndex:       3,
                mixBlendMode: "difference",
              }}
            >
              {typedText}
              <span className="typewriter-cursor" style={{ color: "#d0021b" }}>|</span>
            </p>
            {sourceLine && (
              <p
                style={{
                  fontFamily:    "var(--font-inter), sans-serif",
                  fontSize:      "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color:         "#d0021b",
                  mixBlendMode:  "difference",
                  opacity:       showSource ? 1 : 0,
                  transition:    `opacity ${SOURCE_FADE_MS}ms ease`,
                  margin:        "0.5rem 0 0",
                  position:      "relative",
                  zIndex:        3,
                }}
              >
                {sourceLine}
              </p>
            )}
          </div>
        )}

        {/* BOTTOM — minimal text links */}
        <div
          style={{
            paddingBottom: "3rem",
            paddingLeft:   "1.2rem",
            display:       "flex",
            gap:           "2rem",
          }}
        >
          <Link
            href="/texte"
            style={{
              fontFamily:    "var(--font-inter), sans-serif",
              fontSize:      "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color:         "white",
              position:      "relative",
              zIndex:        3,
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
              position:      "relative",
              zIndex:        3,
            }}
          >
            Kontakt →
          </Link>
        </div>
      </div>

      {/* Desktop circle system — two layers for text inversion.
            Layer 1 (red, z-1): sets the visual color of the circle.
            Layer 2 (white, z-11, difference blend): sits above the text (z-10) and
            inverts it — diff(white, white_text) = black wherever the circle overlaps
            text, diff(white, black_bg) = white in the circle's open areas.
            Flying quotes live at z-12, above both layers, so they drift unaffected.  */}
      <div
        className="desktop-red-circle"
        aria-hidden
        style={{
          position:        "absolute",
          top:              "50%",
          left:             "50%",
          width:            "55vw",
          height:           "55vw",
          borderRadius:     "50%",
          backgroundColor:  "#d0021b",
          zIndex:           1,
          pointerEvents:    "none",
        }}
      />
      <div
        className="desktop-blend-circle"
        aria-hidden
        style={{
          position:        "absolute",
          top:              "50%",
          left:             "50%",
          width:            "55vw",
          height:           "55vw",
          borderRadius:     "50%",
          backgroundColor:  "white",
          mixBlendMode:     "difference",
          zIndex:           11,
          pointerEvents:    "none",
        }}
      />

      {/* ── Desktop: drifting quotes (hidden on mobile) ── */}
      {showQuotes ? (
        <div
          aria-hidden
          className="desktop-quotes absolute inset-0 pointer-events-none select-none quotes-bg"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            zIndex: 12,
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
                {q.sourceLine && (
                  <span
                    style={{
                      display:       "block",
                      fontFamily:    "var(--font-inter), sans-serif",
                      fontSize:      "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontStyle:     "normal",
                      marginTop:     "0.4em",
                    }}
                  >
                    {q.sourceLine}
                  </span>
                )}
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
            <p className="text-paper text-xs tracking-widest uppercase mb-8">{tagline}</p>
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
      <div className="scroll-hint absolute bottom-8 left-0 right-0 mx-auto w-fit flex flex-col items-center gap-2 text-paper/30 animate-bounce motion-reduce:animate-none text-center" style={{ zIndex: 13 }}>
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
        @keyframes circleDrift {
          0%   { transform: translate(-50%, -50%) translate(0, 0); }
          20%  { transform: translate(-50%, -50%) translate(6vw, -4vw); }
          40%  { transform: translate(-50%, -50%) translate(-5vw, 6vw); }
          60%  { transform: translate(-50%, -50%) translate(7vw, 5vw); }
          80%  { transform: translate(-50%, -50%) translate(-6vw, -5vw); }
          100% { transform: translate(-50%, -50%) translate(0, 0); }
        }
      `}</style>

      <style jsx>{`
        /* Mobile: show bespoke layout + fade quote, hide drift layer + desktop content + scroll hint */
        .mobile-hero-content  { display: flex; }
        .mobile-bg-circle {
          display: block;
          transform: translate(-50%, -50%);
          animation: circleDrift 13s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mobile-bg-circle { animation: none; }
        }
        .desktop-hero-content { display: none; }
        .desktop-quotes       { display: none; }
        .scroll-hint           { display: none; }

        /* Mobile: exact viewport height (accounts for browser chrome), content sits at the top */
        @media (max-width: 767px) {
          .hero-section {
            justify-content: flex-start;
            height:     calc(var(--vh, 1vh) * 100);
            height:     100dvh;
            min-height: calc(var(--vh, 1vh) * 100);
            min-height: 100dvh;
          }
        }

        .desktop-red-circle, .desktop-blend-circle { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .desktop-red-circle, .desktop-blend-circle { animation: none; }
        }

        /* Desktop: hide mobile layout, show drift layer + desktop content + scroll hint */
        @media (min-width: 768px) {
          .mobile-hero-content  { display: none; }
          .mobile-bg-circle     { display: none; }
          .desktop-hero-content { display: block; }
          .desktop-quotes       { display: block; }
          .scroll-hint           { display: flex; }
          .desktop-red-circle {
            display: block;
            transform: translate(-50%, -50%);
            animation: circleDrift 13s ease-in-out infinite;
          }
          .desktop-blend-circle {
            display: block;
            transform: translate(-50%, -50%);
            animation: circleDrift 13s ease-in-out infinite;
          }
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
