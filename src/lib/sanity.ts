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

export async function getArticles() {
  return client.fetch(
    `*[_type == "article" && defined(slug.current) && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      _id, title, slug, publishedAt, category, outlet, excerpt, coverImage, externalUrl
    }`,
    {},
    fetchOptions
  );
}


export async function getArticleBySlug(slug: string) {
  return client.fetch(
    `*[_type == "article" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
      _id, title, slug, publishedAt, category, outlet, excerpt, coverImage, externalUrl,
      articleTitle, lead, content
    }`,
    { slug },
    fetchOptions
  );
}

export async function getAbout() {
  return client.fetch(
    `*[_type == "about" && !(_id in path("drafts.**"))][0] { photo, bio }`,
    {},
    fetchOptions
  );
}

export async function getHomepage() {
  return client.fetch(
    `*[_type == "homepage" && _id == "homepage-singleton"][0] {
      heroTagline, heroSubtitle, heroQuotes, aboutTeaser, aboutTags,
      contactTitle, contactSubtitle, contactEmail, contactPhone,
      "featuredArticles": featuredArticles[]-> {
        _id, title, slug, publishedAt, category, outlet, excerpt, coverImage, externalUrl, articleTitle
      }
    }`,
    {},
    { cache: "no-store" }
  );
}
