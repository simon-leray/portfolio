import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

export type ArticleVariant = "wide" | "tall" | "compact";

interface Props {
  article: Article;
  variant: ArticleVariant;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticleCardEditorial({ article, variant }: Props) {
  if (!article.slug?.current && !article.externalUrl) return null;
  const href = article.externalUrl ?? `/texte/${article.slug.current}`;
  const isExternal = !!article.externalUrl;

  // Mobile: always 16/9; desktop varies by variant
  const aspectClass =
    variant === "tall"
      ? "aspect-video md:aspect-[4/3]"
      : variant === "compact"
        ? "aspect-video md:aspect-[3/2]"
        : "aspect-video";

  const titleSize =
    variant === "wide" ? "1.4rem" : variant === "tall" ? "1.1rem" : "1rem";

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex flex-col w-full h-full"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Image — red placeholder when no cover */}
      <div className={`relative overflow-hidden flex-shrink-0 w-full ${aspectClass}`}>
        {article.coverImage ? (
          <Image
            src={urlFor(article.coverImage)
              .width(variant === "wide" ? 1200 : 800)
              .url()}
            alt={article.coverImage.alt ?? article.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.03]"
            sizes={
              variant === "wide"
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
          />
        ) : (
          <div className="w-full h-full bg-red" />
        )}
      </div>

      {/* Text content */}
      <div
        className="flex-1 flex flex-col p-4 border-b-2 border-transparent group-hover:border-red transition-colors duration-200"
        style={{ backgroundColor: "#000000" }}
      >
        <span
          className="text-red uppercase block mb-2 tracking-[0.15em]"
          style={{ fontSize: "0.6rem" }}
        >
          {article.category}
        </span>

        <h2
          className="text-paper leading-snug mb-auto"
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: titleSize,
          }}
        >
          {article.title}
        </h2>

        {variant !== "compact" && article.excerpt && (
          <p className="text-paper/50 text-sm leading-relaxed mt-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        <time
          className="text-paper/30 block mt-3 tracking-[0.1em]"
          style={{ fontSize: "0.65rem" }}
        >
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
