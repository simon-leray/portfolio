import Link from "next/link";

export const metadata = {
  title: "Impressum — Simon Leray",
  description: "Impressum und rechtliche Angaben — Simon Leray, Journalist in Biel/Bienne.",
};

export default function ImpressumPage() {
  return (
    <main className="pt-16">
      <div className="bg-ink text-paper py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-6xl md:text-9xl leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            Impressum<span style={{ color: "#ae0c00" }}>.</span>
          </h1>
        </div>
      </div>

      <div className="bg-paper px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-10">

            <div>
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Verantwortlich</p>
              <p className="text-ink leading-relaxed">
                Simon Leray<br />
                Bieler Tagblatt / Gassmann Media AG<br />
                Robert-Walser-Platz 7<br />
                2501 Biel/Bienne<br />
                Schweiz
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Kontakt</p>
              <p className="text-ink">
                E-Mail:{" "}
                <a
                  href="mailto:simon.leray@bielertagblatt.ch"
                  className="underline underline-offset-2 hover:text-red transition-colors"
                >
                  simon.leray@bielertagblatt.ch
                </a>
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">
                Inhaltliche Verantwortung
              </p>
              <p className="text-ink leading-relaxed">
                Verantwortlich für den Inhalt dieser Website: Simon Leray
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">
                Haftungsausschluss
              </p>
              <p className="text-ink/60 text-sm leading-relaxed">
                Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte die
                Betreiber von leray.me keinen Einfluss haben. Für die Inhalte der verlinkten Seiten
                ist der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei
                Bekanntwerden von Rechtsverletzungen werden entsprechende Links umgehend entfernt.
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <Link
                href="/"
                className="text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors"
                style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.12em" }}
              >
                ← Zurück zur Startseite
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
