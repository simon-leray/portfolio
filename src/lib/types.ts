export interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  category: "Investigativ" | "Porträt" | "Reportage" | "Interview" | "Kommentar" | "Bericht" | "Recherche";
  outlet: "Bieler Tagblatt" | "ajour.ch";
  excerpt: string;
  coverImage?: {
    asset: { _ref: string };
    alt?: string;
    credit?: string;
  };
  externalUrl?: string;
  articleTitle?: string;
  lead?: string;
  content?: ContentBlock[];
  relatedArticles?: Article[];
}

export type ContentBlock =
  | { _type: "block"; _key: string; children: unknown[]; style?: string }
  | { _type: "imageBlock"; _key: string; image: unknown; caption?: string; credit?: string }
  | { _type: "pullQuote"; _key: string; quote: string; author?: string }
  | { _type: "infobox"; _key: string; title: string; text: string }
  | { _type: "divider"; _key: string; style?: string }
  | { _type: "embed"; _key: string; url: string }
  | { _type: "iframeBlock"; _key: string; url: string; height?: number; caption?: string }
  | { _type: "imageGallery"; _key: string; images: GalleryImage[] }
  | { _type: "socialEmbed"; _key: string; platform: "twitter" | "instagram" | "facebook"; embedCode: string }
  | { _type: "videoBlock"; _key: string; url: string; caption?: string };

export interface GalleryImage {
  _key: string;
  asset: { _ref: string };
  alt?: string;
  caption?: string;
  credit?: string;
}

export interface About {
  photo?: { asset: { _ref: string }; alt?: string };
  bio?: unknown[];
}

export interface HeroQuote {
  quote: string;
  source?: string;
}

export interface Homepage {
  heroTagline?: string;
  heroSubtitle?: string;
  heroQuotes?: HeroQuote[];
  aboutTeaser?: unknown[];
  aboutTags?: string[];
  contactTitle?: string;
  contactSubtitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  featuredArticles?: Article[];
}

export interface Dossier {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: {
    asset: { _ref: string };
    source?: string;
  };
  articles?: Article[];
  articleCount?: number;
}
