import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { getAbout } from "@/lib/sanity";
import { About } from "@/lib/types";
import { urlFor } from "@/lib/sanity";
import { replaceQuotesInPtBlocks } from "@/lib/quotes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Über mich — Simon Leray",
  description: "Journalist in Biel/Bienne. Reportagen und Hintergründe für Bieler Tagblatt und ajour.ch.",
};

const bioComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p
        className="text-xl leading-relaxed text-ink mb-6 last:mb-0"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-red hover:text-red transition-colors duration-150"
      >
        {children}
      </a>
    ),
  },
};

export default async function UeberMichPage() {
  let about: About | null = null;
  try {
    about = await getAbout();
  } catch {
    // not configured yet
  }

  return (
    <main className="pt-16">
      <div className="bg-ink text-paper py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red text-xs tracking-widest uppercase mb-6">Journalist</p>
          <h1
            className="text-6xl md:text-9xl leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            Über mich
          </h1>
        </div>
      </div>

      <div className="bg-paper px-6 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
          {/* Photo */}
          <div className="md:col-span-1">
            {about?.photo ? (
              <div className="relative aspect-[3/4] bg-ink/5 overflow-hidden">
                <Image
                  src={urlFor(about.photo).width(600).height(800).url()}
                  alt={about.photo.alt || "Simon Leray"}
                  fill
                  className="object-cover grayscale"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-ink/5 flex items-center justify-center">
                <span
                  className="text-8xl text-ink/20"
                  style={{ fontFamily: "var(--font-bebas), sans-serif" }}
                >
                  SL
                </span>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs tracking-widest uppercase text-ink/40 mb-1">Standort</p>
                <p className="text-sm text-ink">Biel/Bienne, Schweiz</p>
              </div>
              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs tracking-widest uppercase text-ink/40 mb-1">Medien</p>
                <p className="text-sm text-ink">Bieler Tagblatt</p>
                <p className="text-sm text-ink">ajour.ch</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            {about?.bio && about.bio.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <PortableText value={replaceQuotesInPtBlocks(about.bio) as any} components={bioComponents} />
            ) : (
              <div className="space-y-6">
                <p
                  className="text-2xl leading-relaxed text-ink"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Ich bin Simon Leray, freier Journalist in Biel/Bienne. Ich berichte
                  für das Bieler Tagblatt und ajour.ch über Menschen, Politik und das,
                  was die Region bewegt.
                </p>
                <p className="text-ink/60 leading-relaxed">
                  Meine Arbeit umfasst Reportagen, Porträts, investigative Recherchen
                  und Interviews. Ich glaube daran, dass guter Journalismus Geschichten
                  erzählt, die zählen — und Fragen stellt, die gestellt werden müssen.
                </p>
                <p className="text-ink/40 text-sm italic">
                  Bio kann über das Sanity Studio bearbeitet werden.
                </p>
              </div>
            )}

            <div className="mt-12">
              <Link
                href="/kontakt"
                className="inline-block bg-ink text-paper text-xs tracking-widest uppercase px-8 py-4 hover:bg-red transition-colors duration-200"
                style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "0.9rem" }}
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
