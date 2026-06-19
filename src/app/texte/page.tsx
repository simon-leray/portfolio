import Link from "next/link";
import { getArticles, getDossiers } from "@/lib/sanity";
import { Article, Dossier } from "@/lib/types";
import { ArticleCardLight } from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Texte — Simon Leray",
  description: "Alle Texte von Simon Leray: Reportagen, Interviews, Porträts und mehr.",
};

export default async function TextePage() {
  let articles: Article[] = [];
  let dossiers: Dossier[] = [];

  try {
    [articles, dossiers] = await Promise.all([getArticles(), getDossiers()]);
  } catch {
    // not yet configured
  }

  return (
    <main className="pt-16">
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

      <div className="bg-paper px-6 py-16">
        <div className="max-w-7xl mx-auto">

          {/* Dossiers — only shown if at least one exists */}
          {dossiers.length > 0 && (
            <div className="mb-16 pb-16 border-b border-ink/10">
              <p className="text-red text-xs tracking-widest uppercase mb-6">Dossiers</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dossiers.map((dossier) => (
                  <Link
                    key={dossier._id}
                    href={`/dossier/${dossier.slug.current}`}
                    className="group border border-ink/10 p-6 hover:border-red transition-colors duration-200"
                  >
                    <h2
                      className="text-2xl leading-tight mb-2 group-hover:text-red transition-colors duration-200 text-ink"
                      style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
                    >
                      {dossier.title}
                    </h2>
                    <p className="text-red text-xs tracking-widest uppercase mb-2">
                      {dossier.articleCount ?? 0}{" "}
                      {(dossier.articleCount ?? 0) === 1 ? "Text" : "Texte"}
                    </p>
                    {dossier.description && (
                      <p className="text-ink/50 text-sm line-clamp-1">
                        {dossier.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles grid */}
          {articles.length === 0 ? (
            <div className="text-center py-24 text-ink/40">
              <p className="text-lg">Noch keine Texte vorhanden.</p>
              <p className="text-sm mt-2">Füge Artikel über das Sanity Studio hinzu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, i) => (
                <ArticleCardLight
                  key={article._id}
                  article={article}
                  featured={i === 0}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
