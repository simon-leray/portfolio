import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, getArticles, urlFor } from "@/lib/sanity";
import { Article } from "@/lib/types";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
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

      {/* 2. articleTitle + 3. lead — dark band */}
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
    </main>
  );
}
