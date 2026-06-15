import { getArticles } from "@/lib/sanity";
import { Article } from "@/lib/types";
import { ArticleCardLight } from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Texte — Simon Leray",
  description: "Alle Texte von Simon Leray: Reportagen, Interviews, Porträts und mehr.",
};

export default async function TextePage() {
  let articles: Article[] = [];
  try {
    articles = await getArticles();
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
