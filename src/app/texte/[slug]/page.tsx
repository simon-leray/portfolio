import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, getArticles, getDossierForArticle, urlFor } from "@/lib/sanity";
import { Article, Dossier } from "@/lib/types";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { ArticleCard } from "@/components/ArticleCard";
import { replaceQuotes } from "@/lib/quotes";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const articles: Article[] = await getArticles();
    return articles.map((a) => ({ slug: a.slug.current }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const article: Article = await getArticleBySlug(params.slug);
    if (!article) return {};
    return {
      title: `${article.articleTitle ?? article.title} — Simon Leray`,
      description: article.excerpt,
    };
  } catch {
    return {};
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TexteDetailPage({ params }: { params: { slug: string } }) {
  let article: Article | null = null;
  try {
    article = await getArticleBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!article) notFound();

  if (article.externalUrl) {
    redirect(article.externalUrl);
  }

  // Dossier membership check — runs in parallel with nothing, but after article
  // resolves so we have the _id. Fast: single indexed references() lookup.
  let dossier: Dossier | null = null;
  try {
    dossier = await getDossierForArticle(article._id);
  } catch {
    // Non-fatal — page still renders without dossier banner
  }

  const relatedArticles = article.relatedArticles ?? [];

  return (
    <main>
      {/* 1. Full-bleed cover image — flush to top */}
      {article.coverImage ? (
        <div className="relative w-full aspect-[16/7] overflow-hidden bg-ink">
          <Image
            src={urlFor(article.coverImage).width(1600).height(700).url()}
            alt={article.coverImage.alt ?? article.articleTitle ?? article.title}
            fill
            className="object-cover"
            priority
          />
          {article.coverImage.credit && (
            <p className="absolute bottom-3 right-4 text-xs text-paper/50 z-10">
              {article.coverImage.credit}
            </p>
          )}
        </div>
      ) : (
        <div className="h-16 bg-ink" />
      )}

      {/* 2. Dossier banner — thin red strip, only when article belongs to a dossier */}
      {dossier && (
        <div className="bg-red px-6 py-2.5">
          <p className="max-w-4xl mx-auto text-paper text-xs tracking-widest uppercase">
            Teil des Dossiers:{" "}
            <Link
              href={`/dossier/${dossier.slug.current}`}
              className="underline underline-offset-2 hover:no-underline"
            >
              {dossier.title} →
            </Link>
          </p>
        </div>
      )}

      {/* 3. articleTitle + lead — dark band */}
      <div className="bg-ink text-paper">
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-red text-xs font-semibold tracking-widest uppercase">
              {article.category}
            </span>
            <span className="text-paper/40 text-xs">{article.outlet}</span>
            <span className="text-paper/40 text-xs">·</span>
            <time className="text-paper/40 text-xs">{formatDate(article.publishedAt)}</time>
          </div>

          <h1
            className="text-[clamp(2.5rem,8vw,5.5rem)] leading-none text-paper"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.02em" }}
          >
            {article.articleTitle ?? article.title}
          </h1>

          {article.lead && (
            <p
              className="text-xl md:text-2xl leading-relaxed text-paper/70 italic mt-8"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {replaceQuotes(article.lead)}
            </p>
          )}
        </div>
      </div>

      {/* 4. Body */}
      <div className="bg-paper px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {article.content && article.content.length > 0 ? (
            <div className="text-base leading-relaxed">
              <PortableTextRenderer value={article.content as unknown[]} />
            </div>
          ) : (
            <p className="text-ink/40 italic">Kein Inhalt vorhanden.</p>
          )}

          <div className="mt-16 pt-8 border-t border-ink/10">
            <Link
              href="/texte"
              className="text-xs tracking-widest uppercase text-ink/50 hover:text-red transition-colors"
            >
              ← Zurück zu allen Texten
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Related articles — only shown when at least one is set */}
      {relatedArticles.length > 0 && (
        <section className="bg-ink py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2
              className="leading-none mb-8"
              style={{
                fontFamily:    "var(--font-bebas), sans-serif",
                fontSize:      "clamp(2.5rem, 5vw, 4rem)",
                letterSpacing: "0.02em",
                color:         "#d0021b",
              }}
            >
              Dazu auch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-paper/5">
              {relatedArticles.slice(0, 3).map((related) => (
                <ArticleCard key={related._id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
