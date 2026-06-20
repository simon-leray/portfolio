import Link from "next/link";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { getHomepage, getHeroZitate, urlFor } from "@/lib/sanity";
import { Article, Homepage, HeroZitate } from "@/lib/types";
import { replaceQuotesInPtBlocks } from "@/lib/quotes";
import { ArticleCard } from "@/components/ArticleCard";
import { ContactDetails } from "@/components/ContactDetails";
import { Hero } from "@/components/Hero";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [homepage, heroZitate]: [Homepage | null, HeroZitate | null] = await Promise.all([
    getHomepage().catch(() => null),
    getHeroZitate().catch(() => null),
  ]);
  const articles: Article[] = homepage?.featuredArticles ?? [];

  return (
    <main>
      <Hero
        subtitle={homepage?.heroSubtitle}
        quotes={heroZitate?.heroQuotes ?? undefined}
        ctaButtonPrimary={homepage?.ctaButtonPrimary}
        ctaButtonPrimaryLink={homepage?.ctaButtonPrimaryLink}
        ctaButtonSecondary={homepage?.ctaButtonSecondary}
        ctaButtonSecondaryLink={homepage?.ctaButtonSecondaryLink}
      />

      {/* Articles section */}
      <section className="bg-paper py-20 px-6" id="texte">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-12">
            <h2
              className="text-5xl md:text-7xl text-ink"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
            >
              {homepage?.articlesSectionTitle ?? "Ausgewählte Texte"}
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
            <p className="text-red text-xs tracking-widest uppercase mb-6">
              {homepage?.aboutSectionLabel ?? "Über mich"}
            </p>
            <h2
              className="text-5xl md:text-7xl leading-none mb-8"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
            >
              {homepage?.aboutSectionTitle ?? (
                <>Journalismus,<br />der fragt.</>
              )}
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
              {homepage?.aboutButtonText ?? "Mehr erfahren"}
            </Link>
          </div>

          {homepage?.bioPhoto?.asset && (
            <div className="relative w-full" style={{ aspectRatio: "4/5" }}>
              <Image
                src={urlFor(homepage.bioPhoto).width(800).url()}
                alt={homepage.bioPhoto.alt ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>

      {/* Contact section */}
      <section className="bg-paper py-24 px-6" id="kontakt">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-red text-xs tracking-widest uppercase mb-6">
              {homepage?.contactSectionLabel ?? "Kontakt"}
            </p>
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

    </main>
  );
}
