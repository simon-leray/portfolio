import { defineField, defineType } from "sanity";

export const homepageSchema = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroTagline",
      title: "Hero-Tagline",
      description: "Kleiner roter Text über dem Namen (z. B. «Journalist · Biel/Bienne»)",
      type: "string",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero-Untertitel",
      description: "Kursiver Satz unter dem Namen",
      type: "string",
    }),
    defineField({
      name: "aboutTeaser",
      title: "Über-mich-Teaser",
      description: "Kurzer Biotext im dunklen Abschnitt auf der Startseite",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url", title: "URL" }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "aboutTags",
      title: "Tags / Themenschwerpunkte",
      description: "Liste der Schwerpunkte im rechten Panel des Über-mich-Abschnitts",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "contactTitle",
      title: "Kontakt-Titel",
      description: "Grosser Titel im Kontaktabschnitt (z. B. «Schreiben Sie mir.»)",
      type: "string",
    }),
    defineField({
      name: "contactSubtitle",
      title: "Kontakt-Untertitel",
      description: "Kurzer Beschreibungstext unter dem Kontakttitel",
      type: "string",
    }),
    defineField({
      name: "contactEmail",
      title: "Kontakt-E-Mail",
      description: "E-Mail-Adresse, die im Kontaktabschnitt als Link angezeigt wird",
      type: "string",
    }),
    defineField({
      name: "contactPhone",
      title: "Kontakt-Telefon",
      description: "Telefonnummer, die im Kontaktabschnitt als Link angezeigt wird (z. B. +41 32 123 45 67)",
      type: "string",
    }),
    defineField({
      name: "heroQuotes",
      title: "Hero-Zitate",
      description: "Sätze, die im Hintergrund des Hero-Bereichs langsam von rechts nach links driften. Enter = manueller Zeilenumbruch. Reihenfolge und Anzahl sind frei wählbar.",
      type: "array",
      of: [
        {
          type: "object",
          name: "heroQuote",
          title: "Zitat",
          fields: [
            defineField({
              name: "quote",
              title: "Zitat",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "source",
              title: "Quelle",
              description: "z. B. Artikeltitel oder Name",
              type: "string",
            }),
            defineField({
              name: "date",
              title: "Datum",
              description: "z. B. «Juni 2026» oder «15.06.2026»",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "quote", subtitle: "source" },
          },
        },
      ],
    }),
    defineField({
      name: "featuredArticles",
      title: "Artikel auf der Homepage",
      description: "Wähle 1–5 Artikel aus und ordne sie per Drag-and-drop. Der erste Artikel wird gross dargestellt, die anderen als kleine Karten.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (rule) => rule.max(5),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
