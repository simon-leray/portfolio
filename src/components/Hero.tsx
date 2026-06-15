"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const N_SLOTS            = 9;
const TOP_RESERVE        = 8;
const BOTTOM_RESERVE     = 20;
const USABLE             = 100 - TOP_RESERVE - BOTTOM_RESERVE;
const ENTRY_INTERVAL_MIN = 8_000;
const ENTRY_INTERVAL_MAX = 12_000;

const INITIAL_COUNT = 5;

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

// `maxLineLen` is the character count of the longest line in the quote.
function quoteFontSize(maxLineLen: number): string {
  if (maxLineLen < 40)  return "clamp(2.5rem, 5vw, 4rem)";
  if (maxLineLen < 70)  return "clamp(1.6rem, 3vw, 2.6rem)";
  if (maxLineLen < 100) return "clamp(1.3rem, 2.5vw, 2.1rem)";
  return "clamp(1.1rem, 2.2vw, 1.8rem)";
}

// Mobile size class based on total quote length (all lines joined).
function quoteSizeClass(lines: string[]): "qs-short" | "qs-medium" | "qs-long" {
  const total = lines.join(" ").length;
  if (total < 50)  return "qs-short";
  if (total < 100) return "qs-medium";
  return "qs-long";
}

// Split on editor-entered newlines; filter blank lines from trailing \n.
function quoteLines(text: string): string[] {
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  return lines.length ? lines : [text];
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

// Generate `count` random progress values in [0, maxVal] where no two values
// are closer than `minGap`. Uses the spacing-transform: sort N uniform samples
// in the reduced range [0, maxVal - (count-1)*minGap], then shift each by i*minGap.
// This guarantees the minimum gap while keeping the distribution truly random.
function randomSpreadPositions(count: number, maxVal = 0.9, minGap = 0.15): number[] {
  const slack = maxVal - (count - 1) * minGap;
  if (slack <= 0) return Array.from({ length: count }, (_, i) => Math.min(i * minGap, maxVal));
  const raw = Array.from({ length: count }, () => Math.random() * slack).sort((a, b) => a - b);
  return raw.map((v, i) => v + i * minGap);
}

// Bimodal speed distribution: ~70% normal (45-60 s), ~30% noticeably slow (75-100 s).
// Hard floor at 40 s so nothing ever rushes past.
function randomDuration(): number {
  if (Math.random() < 0.7) {
    return 45 + Math.random() * 15;   // normal:  45–60 s
  }
  return 75 + Math.random() * 25;     // slow:   75–100 s
}

let nextId = 0;

export function Hero({ tagline, subtitle, quotes = [] }: Props) {
  const ghostRef = useRef<HTMLDivElement>(null);
  const [activeQuotes, setActiveQuotes] = useState<ActiveQuote[]>([]);

  const activeRef  = useRef<ActiveQuote[]>([]);
  const quotesRef  = useRef(quotes);
  const poolRef    = useRef<string[]>([]);
  const poolIdxRef = useRef(0);
  const mountedRef = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function getNextText(): string {
    if (poolIdxRef.current >= poolRef.current.length) {
      poolRef.current = shuffleArray(quotesRef.current);
      poolIdxRef.current = 0;
    }
    return poolRef.current[poolIdxRef.current++];
  }

  // Seed the screen with quotes already mid-flight.
  // Horizontal positions are randomised each load with minimum 15% spacing.
  // Vertical slots are also picked randomly with collision avoidance.
  function spawnInitialQuotes() {
    const count     = Math.min(INITIAL_COUNT, quotesRef.current.length);
    const positions = randomSpreadPositions(count, 0.9, 0.15); // random progress values
    const usedSlots = new Set<number>();
    const batch: ActiveQuote[] = [];

    for (let i = 0; i < count; i++) {
      const free = Array.from({ length: N_SLOTS }, (_, s) => s).filter(s => !usedSlots.has(s));
      if (!free.length) break;

      const slot     = free[Math.floor(Math.random() * free.length)];
      usedSlots.add(slot);

      const duration = randomDuration();
      const delay    = -(positions[i] * duration); // negative = already in progress
      const text     = getNextText();
      const lines    = quoteLines(text);
      const maxLen   = Math.max(...lines.map(l => l.length));

      batch.push({ id: nextId++, slot, duration, delay, lines, fontSize: quoteFontSize(maxLen), sizeClass: quoteSizeClass(lines) });
    }

    setActiveQuotes(batch);
    activeRef.current = batch;
  }

  // Add one quote from the right edge to a random free slot.
  // If all N_SLOTS are occupied, retries after 1.5 s instead of skipping.
  function trySpawnQuote() {
    if (!mountedRef.current) return;

    const occupied = new Set(activeRef.current.map(q => q.slot));
    const free     = Array.from({ length: N_SLOTS }, (_, i) => i).filter(s => !occupied.has(s));

    if (!free.length) {
      retryRef.current = setTimeout(trySpawnQuote, 1500);
      return;
    }

    const slot     = free[Math.floor(Math.random() * free.length)];
    const text     = getNextText();
    const lines    = quoteLines(text);
    const maxLen   = Math.max(...lines.map(l => l.length));
    const duration = randomDuration();

    const q: ActiveQuote = {
      id: nextId++,
      slot,
      duration,
      delay: 0,
      lines,
      fontSize: quoteFontSize(maxLen),
      sizeClass: quoteSizeClass(lines),
    };

    setActiveQuotes(prev => {
      const next = [...prev, q];
      activeRef.current = next;
      return next;
    });
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
    setActiveQuotes(prev => {
      const next = prev.filter(q => q.id !== id);
      activeRef.current = next;
      return next;
    });
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
      if (timerRef.current)  clearTimeout(timerRef.current);
      if (retryRef.current)  clearTimeout(retryRef.current);
    };
  }, []); // intentional: run once on mount

  const showQuotes = quotes.length > 0;

  return (
    <section className="relative min-h-screen bg-ink text-paper flex flex-col justify-center overflow-hidden pt-16">

      {showQuotes ? (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none select-none quotes-bg"
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

      {/* Foreground content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="animate-fade-up">
          {tagline && (
            <p className="text-red text-xs tracking-widest uppercase mb-8">
              {tagline}
            </p>
          )}

          <h1
            className="text-[clamp(3.5rem,12vw,9rem)] leading-none text-paper mb-8"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            Simon
            <br />
            Leray
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-paper/30 animate-bounce motion-reduce:animate-none">
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
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease forwards;
        }
        @media (max-width: 767px) {
          .drift {
            font-size: 0.65rem !important;
            line-height: 1.4;
            max-width: 75vw;
            color: rgba(255, 255, 255, 0.09);
          }
          .quotes-bg {
            clip-path: inset(0 0 40% 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up { animation: none; }
          .drift { animation: none; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
