import { defineField, defineType } from "sanity";

export const homepageSchema = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroSubtitle",
      title: "Hero-Untertitel",
      description: "Kursiver Satz unter dem Namen",
      type: "string",
    }),
    defineField({
      name: "ctaButtonPrimary",
      title: "Hero — Primär-Button",
      description: "Text des ersten Buttons im Hero-Bereich (z. B. «Artikel lesen»)",
      type: "string",
      initialValue: "Artikel lesen",
    }),
    defineField({
      name: "ctaButtonSecondary",
      title: "Hero — Sekundär-Button",
      description: "Text des zweiten Buttons im Hero-Bereich (z. B. «Kontakt»)",
      type: "string",
      initialValue: "Kontakt",
    }),
    defineField({
      name: "articlesSectionTitle",
      title: "Artikel-Abschnitt — Titel",
      description: "Überschrift über dem Artikelraster auf der Startseite",
      type: "string",
      initialValue: "Ausgewählte Texte",
    }),
    defineField({
      name: "featuredArticles",
      title: "Artikel auf der Homepage",
      description: "Wähle 1–5 Artikel aus und ordne sie per Drag-and-drop. Der erste Artikel wird gross dargestellt, die anderen als kleine Karten.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: "aboutSectionLabel",
      title: "Über-mich-Teaser — Label",
      description: "Kleiner roter Text über der Überschrift im Über-mich-Abschnitt (z. B. «Über mich»)",
      type: "string",
      initialValue: "Über mich",
    }),
    defineField({
      name: "aboutSectionTitle",
      title: "Über-mich-Teaser — Überschrift",
      description: "Grosse Überschrift im Über-mich-Abschnitt der Startseite",
      type: "string",
      initialValue: "Journalismus, der fragt.",
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
      name: "aboutButtonText",
      title: "Über-mich-Teaser — Button-Text",
      description: "Text des «Mehr erfahren»-Buttons im Über-mich-Abschnitt",
      type: "string",
      initialValue: "Mehr erfahren",
    }),
    defineField({
      name: "contactSectionLabel",
      title: "Kontakt-Abschnitt — Label",
      description: "Kleiner roter Text über dem Kontakt-Titel auf der Startseite",
      type: "string",
      initialValue: "Kontakt",
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
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
