import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { getHomepage } from "@/lib/sanity";
import { Article, Homepage } from "@/lib/types";
import { replaceQuotesInPtBlocks } from "@/lib/quotes";
import { ArticleCard } from "@/components/ArticleCard";
import { ContactDetails } from "@/components/ContactDetails";
import { Hero } from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homepage: Homepage | null = await getHomepage().catch(() => null);
  const articles: Article[] = homepage?.featuredArticles ?? [];

  const aboutTags = homepage?.aboutTags ?? [
    "Investigativ",
    "Reportage",
    "Porträt",
    "Interview",
    "Kommentar",
  ];

  return (
    <main>
      <Hero
        tagline={homepage?.heroTagline}
        subtitle={homepage?.heroSubtitle}
        quotes={homepage?.heroQuotes ?? undefined}
      />

      {/* Articles section */}
      <section className="bg-paper py-20 px-6" id="texte">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-12">
            <h2
              className="text-5xl md:text-7xl text-ink"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
            >
              Ausgewählte Texte
            </h2>
            <Link
              href="/texte"
              className="text-xs tracking-widest uppercase text-ink/50 hover:text-red transition-colors border-b border-ink/20 hover:border-red pb-0.5"
            >
              Alle ansehen →
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/10">
              {articles.map((article, i) => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  featured={i === 0}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/10">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-ink/5 h-64 animate-pulse ${i === 0 ? "md:col-span-2" : ""}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About teaser */}
      <section className="bg-ink text-paper py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-red text-xs tracking-widest uppercase mb-6">Über mich</p>
            <h2
              className="text-5xl md:text-7xl leading-none mb-8"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
            >
              Journalismus,
              <br />
              der fragt.
            </h2>

            {homepage?.aboutTeaser && homepage.aboutTeaser.length > 0 ? (
              <div className="mb-8">
                <PortableText
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value={replaceQuotesInPtBlocks(homepage.aboutTeaser) as any}
                  components={{
                    block: {
                      normal: ({ children }) => (
                        <p
                          className="text-paper/70 text-lg leading-relaxed mb-4 last:mb-0"
                          style={{ fontFamily: "var(--font-playfair), serif" }}
                        >
                          {children}
                        </p>
                      ),
                    },
                    marks: {
                      strong: ({ children }) => <strong className="font-semibold text-paper">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      link: ({ children, value }) => (
                        <a
                          href={value?.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-b border-red hover:text-red transition-colors"
                        >
                          {children}
                        </a>
                      ),
                    },
                  }}
                />
              </div>
            ) : (
              <p
                className="text-paper/70 text-lg leading-relaxed mb-8"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Ich bin Simon Leray, freier Journalist in Biel/Bienne. Ich berichte
                für das Bieler Tagblatt und ajour.ch über Menschen, Politik und
                das, was die Region bewegt.
              </p>
            )}

            <Link
              href="/ueber-mich"
              className="inline-block border border-paper/30 text-paper text-xs tracking-widest uppercase px-8 py-4 hover:bg-red hover:border-red transition-colors duration-200"
              style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "0.9rem" }}
            >
              Mehr erfahren
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="border border-paper/10 p-8">
              <div className="space-y-4">
                {aboutTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-4 border-b border-paper/10 pb-4 last:border-0 last:pb-0"
                  >
                    <span className="w-2 h-2 bg-red rounded-full flex-shrink-0" />
                    <span
                      className="text-2xl text-paper/80 hover:text-paper transition-colors"
                      style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="bg-paper py-24 px-6" id="kontakt">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-red text-xs tracking-widest uppercase mb-6">Kontakt</p>
            <h2
              className="text-5xl md:text-7xl leading-none text-ink mb-8"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
            >
              {homepage?.contactTitle ?? "Schreiben\nSie mir."}
            </h2>
            <p className="text-ink/60 leading-relaxed">
              {homepage?.contactSubtitle ?? "Für Anfragen, Tipps oder Zusammenarbeit stehe ich gerne zur Verfügung."}
            </p>
          </div>
          <div className="pt-2">
            <ContactDetails
              email={homepage?.contactEmail}
              phone={homepage?.contactPhone}
            />
          </div>
        </div>
      </section>

      <footer className="bg-ink text-paper/40 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wider">
          <span
            className="text-2xl text-paper"
            style={{ fontFamily: "var(--font-bebas), sans-serif" }}
          >
            SL<span className="text-red">.</span>
          </span>
          <span>© {new Date().getFullYear()} Simon Leray</span>
          <span>Biel/Bienne, Schweiz</span>
        </div>
      </footer>
    </main>
  );
}
