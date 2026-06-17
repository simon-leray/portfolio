import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pt-16 min-h-screen bg-ink text-paper flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">

        <div
          className="leading-none mb-8 select-none"
          style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: "clamp(8rem, 28vw, 22rem)",
            lineHeight: 0.85,
          }}
        >
          <span className="text-paper">4</span>
          <span style={{ color: "#d0021b" }}>0</span>
          <span className="text-paper">4</span>
        </div>

        <h1
          className="text-2xl md:text-4xl leading-tight mb-4"
          style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
        >
          Diese Seite gibt es nicht<span style={{ color: "#d0021b" }}>.</span>
          <br />
          Noch nicht recherchiert<span style={{ color: "#d0021b" }}>?</span>
        </h1>

        <p
          className="text-paper/40 text-sm mb-12"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Die gesuchte Seite wurde nicht gefunden.
        </p>

        <Link
          href="/"
          className="inline-block px-10 py-4 text-paper"
          style={{
            fontFamily: "var(--font-bebas), sans-serif",
            fontSize: "1rem",
            letterSpacing: "0.15em",
            backgroundColor: "#d0021b",
          }}
        >
          ZURÜCK ZUR STARTSEITE →
        </Link>

      </div>
    </main>
  );
}
