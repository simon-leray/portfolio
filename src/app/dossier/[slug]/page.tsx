import { notFound } from "next/navigation";
import Link from "next/link";
import { getDossierBySlug, getDossiers } from "@/lib/sanity";
import { Dossier } from "@/lib/types";
import { ArticleCard } from "@/components/ArticleCard";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const dossiers: Dossier[] = await getDossiers();
    return dossiers.map((d) => ({ slug: d.slug.current }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const dossier: Dossier = await getDossierBySlug(params.slug);
    if (!dossier) return {};
    return {
      title: `Dossier: ${dossier.title} — Simon Leray`,
      description: dossier.description,
    };
  } catch {
    return {};
  }
}

export default async function DossierPage({ params }: { params: { slug: string } }) {
  let dossier: Dossier | null = null;
  try {
    dossier = await getDossierBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!dossier) notFound();

  const articles = dossier.articles ?? [];

  return (
    <main className="pt-16">
      {/* Header */}
      <div className="bg-ink text-paper py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red text-xs tracking-widest uppercase mb-6">Dossier</p>
          <h1
            className="text-6xl md:text-9xl leading-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            {dossier.title}
          </h1>
          {dossier.description && (
            <p
              className="text-paper/70 text-xl leading-relaxed mt-8 max-w-2xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {dossier.description}
            </p>
          )}
          <p className="text-paper/30 text-xs tracking-widest uppercase mt-6">
            {articles.length} {articles.length === 1 ? "Artikel" : "Artikel"}
          </p>
        </div>
      </div>

      {/* Articles in defined order */}
      <div className="bg-ink px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-paper/5">
              {articles.map((article, i) => (
                <ArticleCard key={article._id} article={article} featured={i === 0} />
              ))}
            </div>
          ) : (
            <p className="text-paper/30 italic py-16">
              Noch keine Artikel in diesem Dossier.
            </p>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="bg-ink border-t border-paper/10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/texte"
            className="text-xs tracking-widest uppercase text-paper/30 hover:text-paper/60 transition-colors"
          >
            ← Zurück zu allen Texten
          </Link>
        </div>
      </div>
    </main>
  );
}
