export interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  category: "Investigativ" | "Porträt" | "Reportage" | "Interview" | "Kommentar" | "Bericht" | "Recherche";
  outlet?: string | string[];
  excerpt: string;
  coverImage?: {
    asset: { _ref: string };
    alt?: string;
    credit?: string;
  };
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
  pageTitle?: string;
  pageSubtitle?: string;
  contactButtonText?: string;
  contactButtonLink?: string;
  location?: string;
  media?: string[];
  photo?: { asset: { _ref: string }; alt?: string };
  bio?: unknown[];
}

export interface Contact {
  pageLabel?: string;
  pageTitle?: string;
  introText?: string;
  locationValue?: string;
  mediaLabel?: string;
  mediaItems?: string[];
}

export interface HeroQuote {
  quote: string;
  source?: string;
}

export interface HeroZitate {
  heroQuotes?: HeroQuote[];
}

export interface TexteSeite {
  textePageTitle?: string;
  textePageSubtitle?: string;
}

export interface Homepage {
  heroSubtitle?: string;
  ctaButtonPrimary?: string;
  ctaButtonPrimaryLink?: string;
  ctaButtonSecondary?: string;
  ctaButtonSecondaryLink?: string;
  articlesSectionTitle?: string;
  aboutButtonText?: string;
  contactSectionLabel?: string;
  aboutSectionLabel?: string;
  aboutSectionTitle?: string;
  aboutTeaser?: unknown[];
  bioPhoto?: { asset: { _ref: string }; alt?: string };
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
