import Image from "next/image";
import Link from "next/link";
import { getArticles, getDossiers, urlFor } from "@/lib/sanity";
import { Article, Dossier } from "@/lib/types";
import { ArticleCardEditorial, ArticleVariant } from "@/components/ArticleCardEditorial";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Texte — Simon Leray",
  description: "Alle Texte von Simon Leray: Reportagen, Interviews, Porträts und mehr.",
};

// Pattern: wide@{0,3,7,11,…}, tall@{1,5,9,…}, compact@everything else.
// Each group of 7 articles fills exactly 4 rows in a 3-column grid with no empty cells.
function getVariant(i: number): ArticleVariant {
  if (i === 0 || (i >= 3 && (i - 3) % 4 === 0)) return "wide";
  if ((i - 1) % 4 === 0) return "tall";
  return "compact";
}

export default async function TextePage() {
  let articles: Article[] = [];
  let dossiers: Dossier[] = [];

  try {
    [articles, dossiers] = await Promise.all([getArticles(), getDossiers()]);
  } catch {
    // not yet configured
  }

  // Build editorial grid items, inserting a red accent line every 7 articles
  // (end of each 4-row repeating cycle) to avoid breaking mid-row.
  const gridItems = articles.flatMap((article, i) => {
    const variant = getVariant(i);
    const card = (
      <div
        key={article._id}
        className={variant === "wide" ? "col-span-1 md:col-span-2" : "col-span-1"}
      >
        <ArticleCardEditorial article={article} variant={variant} />
      </div>
    );

    // Insert red accent after the 7th article in each cycle (index 6, 13, 20 …)
    // These correspond to the end of a full row, keeping the grid intact.
    if ((i + 1) % 7 === 0 && i < articles.length - 1) {
      return [
        card,
        <div
          key={`accent-${i}`}
          className="col-span-1 md:col-span-3 h-px"
          style={{ backgroundColor: "#d0021b" }}
          aria-hidden
        />,
      ];
    }
    return [card];
  });

  return (
    <main className="pt-16">
      {/* Page header */}
      <div className="bg-ink text-paper py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red text-xs tracking-widest uppercase mb-6">Alle Texte</p>
          <h1
            className="text-6xl md:text-9xl leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            Texte
          </h1>
        </div>
      </div>

      {/* Dossiers — light section, only when at least one exists */}
      {dossiers.length > 0 && (
        <div className="bg-paper px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <p className="text-red text-xs tracking-widest uppercase mb-6">Dossiers</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dossiers.map((dossier) => (
                <Link
                  key={dossier._id}
                  href={`/dossier/${dossier.slug.current}`}
                  className="group border border-ink/10 overflow-hidden hover:border-red transition-colors duration-200 flex flex-col"
                >
                  <div className="relative h-40 flex-shrink-0 overflow-hidden">
                    {dossier.coverImage ? (
                      <Image
                        src={urlFor(dossier.coverImage).width(600).height(320).url()}
                        alt={dossier.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-red" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <h2
                      className="text-2xl leading-tight group-hover:text-red transition-colors duration-200 text-ink"
                      style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
                    >
                      {dossier.title}
                    </h2>
                    <p className="text-red text-xs tracking-widest uppercase">
                      {dossier.articleCount ?? 0}{" "}
                      {(dossier.articleCount ?? 0) === 1 ? "Text" : "Texte"}
                    </p>
                    {dossier.description && (
                      <p className="text-ink/50 text-sm line-clamp-3">{dossier.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Articles — dark editorial grid */}
      {articles.length === 0 ? (
        <div className="bg-paper px-6 py-24">
          <div className="max-w-7xl mx-auto text-center text-ink/40">
            <p className="text-lg">Noch keine Texte vorhanden.</p>
            <p className="text-sm mt-2">Füge Artikel über das Sanity Studio hinzu.</p>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ backgroundColor: "#1c1c1c" }}
        >
          {gridItems}
        </div>
      )}
    </main>
  );
}
