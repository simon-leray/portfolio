import Link from "next/link";

export const metadata = {
  title: "Datenschutz — Simon Leray",
  description: "Datenschutzerklärung — Simon Leray, Journalist in Biel/Bienne.",
};

export default function DatenschutzPage() {
  return (
    <main className="pt-16">
      <div className="bg-ink text-paper py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-6xl md:text-9xl leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            Datenschutz<span style={{ color: "#ae0c00" }}>.</span>
          </h1>
        </div>
      </div>

      <div className="bg-paper px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-10">

            <div>
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Verantwortliche Person</p>
              <p className="text-ink leading-relaxed">
                Bieler Tagblatt<br />
                Simon Leray<br />
                Robert-Walser-Platz 7<br />
                2501 Biel/Bienne<br />
                <a
                  href="mailto:simon.leray@bielertagblatt.ch"
                  className="underline underline-offset-2 hover:text-red transition-colors"
                >
                  simon.leray@bielertagblatt.ch
                </a>
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Hosting</p>
              <p className="text-ink/80 text-sm leading-relaxed">
                Diese Website wird über Vercel (Vercel Inc., San Francisco, USA) gehostet. Beim
                Aufruf der Website werden technische Zugriffsdaten (IP-Adresse, Browsertyp, Zeitpunkt
                des Zugriffs) in Server-Logs gespeichert. Diese Daten werden ausschliesslich für den
                technischen Betrieb verwendet und nicht an Dritte weitergegeben.
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Analyse</p>
              <p className="text-ink/80 text-sm leading-relaxed">
                Diese Website nutzt Vercel Analytics, ein cookieloses und datenschutzfreundliches
                Analysetool. Es werden keine personenbezogenen Daten gespeichert und kein
                Cookie-Tracking durchgeführt.
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Inhalte</p>
              <p className="text-ink/80 text-sm leading-relaxed">
                Die Inhalte dieser Website werden über Sanity (Sanity.io, Oslo, Norwegen) verwaltet.
                Es werden keine personenbezogenen Daten von Besucherinnen und Besuchern in diesem
                System gespeichert.
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Kontakt</p>
              <p className="text-ink/80 text-sm leading-relaxed">
                Wenn Sie per E-Mail Kontakt aufnehmen, werden Ihre Angaben zur Bearbeitung der
                Anfrage verwendet und nicht an Dritte weitergegeben.
              </p>
            </div>

            <div className="border-t border-ink/10 pt-8">
              <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">Rechte</p>
              <p className="text-ink/80 text-sm leading-relaxed">
                Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten gemäss dem
                Schweizer Datenschutzgesetz (DSG). Kontaktieren Sie mich unter{" "}
                <a
                  href="mailto:simon.leray@bielertagblatt.ch"
                  className="underline underline-offset-2 hover:text-red transition-colors"
                >
                  simon.leray@bielertagblatt.ch
                </a>
                .
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
