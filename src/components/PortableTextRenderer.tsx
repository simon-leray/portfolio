import { PortableText, PortableTextComponents } from "@portabletext/react";
import { ArticleImage } from "./ArticleImage";
import { ImageGallery } from "./ImageGallery";
import { SocialEmbed } from "./SocialEmbed";
import { replaceQuotes, replaceQuotesInPtBlocks } from "@/lib/quotes";

function parseVideoUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // malformed URL
  }
  return null;
}

// Wrap pull-quote text with outer Swiss guillemets; replaceQuotes handles inner pairs.
function addGuillemets(text: string): string {
  return `« ${replaceQuotes(text)} »`;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 leading-relaxed text-ink/80">{children}</p>
    ),
    zwischentitel: ({ children }) => (
      <h2 className="text-[20px] md:text-[26px] font-bold mb-4 mt-10 text-ink">
        {children}
      </h2>
    ),
    zwischentitelFarbig: ({ children }) => (
      <h2
        className="text-[20px] md:text-[26px] font-bold mb-4 mt-10"
        style={{ color: "#d0021b" }}
      >
        {children}
      </h2>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-red hover:text-red transition-colors duration-150"
      >
        {children}
      </a>
    ),
  },
  types: {
    imageBlock: ({ value }) => (
      <ArticleImage
        image={value.image}
        caption={value.caption}
        credit={value.credit}
      />
    ),

    pullQuote: ({ value }) => (
      <blockquote className="my-10 border-l-4 border-red pl-6">
        <p
          className="text-2xl md:text-3xl leading-snug text-ink"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {addGuillemets(value.quote ?? "")}
        </p>
        {value.author && (
          <cite className="block mt-3 text-sm text-ink/50 not-italic">
            — {value.author}
          </cite>
        )}
      </blockquote>
    ),

    infobox: ({ value }) => (
      <aside className="my-8 bg-ink text-paper p-6">
        {value.title && (
          <h4
            className="text-lg mb-3"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
          >
            {value.title}
          </h4>
        )}
        <p className="text-sm leading-relaxed text-paper/80">{value.text}</p>
      </aside>
    ),

    divider: () => (
      <div className="my-10 flex items-center justify-center gap-3" aria-hidden>
        <span className="w-2 h-2 bg-red rounded-full" />
        <span className="w-2 h-2 bg-ink/20 rounded-full" />
        <span className="w-2 h-2 bg-ink/20 rounded-full" />
      </div>
    ),

    embed: ({ value }) => {
      if (!value.url) return null;
      const embedUrl = parseVideoUrl(value.url);
      if (embedUrl) {
        return (
          <div className="my-8 relative aspect-video">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }
      return (
        <div className="my-8">
          <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-red underline text-sm">
            {value.url}
          </a>
        </div>
      );
    },

    iframeBlock: ({ value }) => {
      if (!value.url) return null;
      return (
        <figure className="my-8">
          <div className="w-full overflow-hidden border border-ink/10">
            <iframe
              src={value.url}
              height={value.height ?? 500}
              className="w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-xs text-ink/50">{value.caption}</figcaption>
          )}
        </figure>
      );
    },

    imageGallery: ({ value }) => {
      if (!value.images?.length) return null;
      return <ImageGallery images={value.images} />;
    },

    socialEmbed: ({ value }) => {
      if (!value.embedCode) return null;
      return <SocialEmbed platform={value.platform} embedCode={value.embedCode} />;
    },

    videoBlock: ({ value }) => {
      if (!value.url) return null;
      const embedUrl = parseVideoUrl(value.url);
      if (!embedUrl) {
        return (
          <div className="my-8 border border-ink/10 p-6 text-ink/40 text-sm text-center">
            Ungültige Video-URL. Unterstützt: YouTube, Vimeo.
          </div>
        );
      }
      const isVimeo = embedUrl.includes("vimeo");
      return (
        <figure className="my-8">
          <div className="relative aspect-video bg-ink">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy={isVimeo ? "strict-origin" : undefined}
              loading="lazy"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-xs text-ink/50">{value.caption}</figcaption>
          )}
        </figure>
      );
    },
  },
};

export function PortableTextRenderer({ value }: { value: unknown[] }) {
  return (
    <div className="max-w-prose">
      <PortableText value={replaceQuotesInPtBlocks(value)} components={components} />
    </div>
  );
}
