import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatOutlet(outlet: Article["outlet"]): string {
  if (!outlet) return "";
  if (typeof outlet === "string") return outlet;
  if (Array.isArray(outlet)) {
    const strings = outlet.filter((item): item is string => typeof item === "string");
    return strings.join(" · ");
  }
  return "";
}

interface Props {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: Props) {
  if (!article.slug?.current) return null;
  const href = `/texte/${article.slug.current}`;

  return (
    <Link
      href={href}
      className={`group block bg-ink text-paper overflow-hidden ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {article.coverImage && (
        <div
          className={`relative overflow-hidden ${featured ? "h-72 md:h-96" : "h-48"}`}
        >
          <Image
            src={urlFor(article.coverImage).width(featured ? 1200 : 600).height(featured ? 600 : 400).url()}
            alt={article.coverImage.alt || article.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/20 transition-colors duration-300" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-red text-xs font-semibold tracking-widest uppercase">
            {article.category}
          </span>
          <span className="text-paper/40 text-xs">{formatOutlet(article.outlet)}</span>
        </div>

        <h2
          className={`font-playfair leading-tight mb-3 group-hover:text-red transition-colors duration-200 ${
            featured ? "text-2xl md:text-3xl" : "text-xl"
          }`}
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {article.title}
        </h2>

        <p className="text-paper/60 text-sm leading-relaxed line-clamp-3 mb-4">
          {article.excerpt}
        </p>

        <time className="text-paper/40 text-xs tracking-wider">
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  );
}

export function ArticleCardLight({ article, featured = false }: Props) {
  if (!article.slug?.current) return null;
  const href = `/texte/${article.slug.current}`;

  return (
    <Link
      href={href}
      className={`group block border border-ink/10 overflow-hidden hover:border-red transition-colors duration-200 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {article.coverImage && (
        <div
          className={`relative overflow-hidden bg-ink/5 ${featured ? "h-64 md:h-80" : "h-44"}`}
        >
          <Image
            src={urlFor(article.coverImage).width(featured ? 1200 : 600).height(featured ? 500 : 350).url()}
            alt={article.coverImage.alt || article.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-red text-xs font-semibold tracking-widest uppercase">
            {article.category}
          </span>
          <span className="text-ink/40 text-xs">{formatOutlet(article.outlet)}</span>
        </div>

        <h2
          className={`font-playfair leading-tight mb-2 group-hover:text-red transition-colors duration-200 text-ink ${
            featured ? "text-2xl md:text-3xl" : "text-lg"
          }`}
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {article.title}
        </h2>

        <p className="text-ink/60 text-sm leading-relaxed line-clamp-2 mb-4">
          {article.excerpt}
        </p>

        <time className="text-ink/40 text-xs tracking-wider">
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
