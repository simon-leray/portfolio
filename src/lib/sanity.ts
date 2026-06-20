import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  // Disable CDN in dev so we always get fresh data; use CDN in production.
  useCdn: process.env.NODE_ENV === "production",
});

const builder = createImageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// Shared fetch options: revalidate every 60 s so published changes appear quickly.
const fetchOptions = { next: { revalidate: 60 } };

// Shared article card projection — used in multiple queries.
const ARTICLE_CARD_FIELDS = `_id, title, slug, publishedAt, category, outlet, excerpt, coverImage, externalUrl`;

export async function getArticles() {
  return client.fetch(
    `*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))
        && (showInTexte == true || !defined(showInTexte))] | order(publishedAt desc) {
      ${ARTICLE_CARD_FIELDS}
    }`,
    {},
    fetchOptions
  );
}

export async function getArticleBySlug(slug: string) {
  return client.fetch(
    `*[_type == "article" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      ${ARTICLE_CARD_FIELDS}, articleTitle, lead, content,
      "relatedArticles": relatedArticles[]-> {
        ${ARTICLE_CARD_FIELDS}
      }
    }`,
    { slug },
    fetchOptions
  );
}

export async function getAbout() {
  return client.fetch(
    `*[_type == "about" && !(_id in path("drafts.**"))][0] {
      pageTitle, pageSubtitle, contactButtonText, location, media, photo, bio
    }`,
    {},
    fetchOptions
  );
}

export async function getContact() {
  return client.fetch(
    `*[_type == "contact" && !(_id in path("drafts.**"))][0] {
      pageLabel, pageTitle, introText,
      locationLabel, locationValue,
      mediaLabel, mediaItems
    }`,
    {},
    fetchOptions
  );
}

export async function getHomepage() {
  return client.fetch(
    `*[_type == "homepage" && _id == "homepage-singleton"][0] {
      heroSubtitle,
      ctaButtonPrimary, ctaButtonSecondary, articlesSectionTitle,
      aboutButtonText, contactSectionLabel,
      aboutSectionLabel, aboutSectionTitle, aboutTeaser, aboutTags,
      contactTitle, contactSubtitle, contactEmail, contactPhone,
      "featuredArticles": featuredArticles[]-> {
        ${ARTICLE_CARD_FIELDS}, articleTitle
      }
    }`,
    {},
    { cache: "no-store" }
  );
}

export async function getHeroZitate() {
  return client.fetch(
    `*[_type == "hero-zitate" && _id == "hero-zitate-singleton"][0] {
      heroQuotes
    }`,
    {},
    fetchOptions
  );
}

export async function getTexteSeite() {
  return client.fetch(
    `*[_type == "texte-seite" && _id == "texte-seite-singleton"][0] {
      textePageTitle, textePageSubtitle
    }`,
    {},
    fetchOptions
  );
}

// ── Dossier queries ───────────────────────────────────────────────────────────

export async function getDossiers() {
  return client.fetch(
    `*[_type == "dossier" && defined(slug.current) && !(_id in path("drafts.**"))] | order(title asc) {
      _id, title, slug, description, coverImage,
      "articleCount": count(articles)
    }`,
    {},
    fetchOptions
  );
}

export async function getDossierBySlug(slug: string) {
  return client.fetch(
    `*[_type == "dossier" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      _id, title, slug, description,
      "articles": articles[]-> { ${ARTICLE_CARD_FIELDS} }
    }`,
    { slug },
    fetchOptions
  );
}

// Returns the first dossier that contains the given article ID, or null.
export async function getDossierForArticle(articleId: string) {
  return client.fetch(
    `*[_type == "dossier" && references($articleId) && !(_id in path("drafts.**"))][0] {
      _id, title, slug
    }`,
    { articleId },
    fetchOptions
  );
}
