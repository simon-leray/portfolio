import { getHomepage, getContact } from "@/lib/sanity";
import { Contact } from "@/lib/types";
import { ContactDetails } from "@/components/ContactDetails";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kontakt — Simon Leray",
  description: "Schreiben Sie Simon Leray — Journalist in Biel/Bienne.",
};

export default async function KontaktPage() {
  const [homepage, contact] = await Promise.all([
    getHomepage().catch(() => null),
    getContact().catch(() => null) as Promise<Contact | null>,
  ]);

  const locationValue = contact?.locationValue ?? "Biel/Bienne, Schweiz";
  const mediaLabel = contact?.mediaLabel ?? "Medien";
  const mediaItems = contact?.mediaItems ?? ["Bieler Tagblatt", "ajour.ch"];

  return (
    <main className="pt-16">
      <div className="bg-ink text-paper py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red text-xs tracking-widest uppercase mb-6">
            {contact?.pageLabel ?? "Schreiben Sie mir"}
          </p>
          <h1
            className="text-6xl md:text-9xl leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            {contact?.pageTitle ?? "Kontakt"}
          </h1>
        </div>
      </div>

      <div className="bg-paper px-6 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p
              className="text-xl leading-relaxed text-ink mb-8"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {contact?.introText ??
                "Für Anfragen, Hinweise, Zusammenarbeit oder einfach ein Gespräch — ich freue mich über Ihre Nachricht."}
            </p>

            <div className="space-y-6">
              <div className="border-t border-ink/10 pt-6">
                <p className="text-xs tracking-widest uppercase text-ink/40 mb-1">
                  Standorte
                </p>
                <p className="text-ink">{locationValue}</p>
              </div>
              <div className="border-t border-ink/10 pt-6">
                <p className="text-xs tracking-widest uppercase text-ink/40 mb-2">
                  {mediaLabel}
                </p>
                {mediaItems.map((m) => (
                  <p key={m} className="text-ink">{m}</p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <ContactDetails
              email={homepage?.contactEmail}
              phone={homepage?.contactPhone}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
