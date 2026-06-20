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
      title: "Hero Button Left",
      description: "Text des linken Buttons im Hero-Bereich",
      type: "string",
      initialValue: "Artikel lesen",
    }),
    defineField({
      name: "ctaButtonPrimaryLink",
      title: "Hero Button Left — Link",
      description: "Ziel-URL des linken Buttons (Standard: /texte)",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "ctaButtonSecondary",
      title: "Hero Button Right",
      description: "Text des rechten Buttons im Hero-Bereich",
      type: "string",
      initialValue: "Kontakt",
    }),
    defineField({
      name: "ctaButtonSecondaryLink",
      title: "Hero Button Right — Link",
      description: "Ziel-URL des rechten Buttons (Standard: /kontakt)",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "articlesSectionTitle",
      title: "Header Section «Articles»",
      description: "Überschrift über dem Artikelraster auf der Startseite",
      type: "string",
      initialValue: "Ausgewählte Texte",
    }),
    defineField({
      name: "featuredArticles",
      title: "Hero Articles",
      description: "Wähle 1–5 Artikel aus und ordne sie per Drag-and-drop. Der erste Artikel wird gross dargestellt, die anderen als kleine Karten.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: "aboutSectionLabel",
      title: "Subtitle Section «Bio»",
      description: "Kleiner roter Text über der Überschrift im Bio-Abschnitt",
      type: "string",
      initialValue: "Über mich",
    }),
    defineField({
      name: "aboutSectionTitle",
      title: "Header Section «Bio»",
      description: "Grosse Überschrift im Bio-Abschnitt der Startseite",
      type: "string",
      initialValue: "Journalismus, der fragt.",
    }),
    defineField({
      name: "aboutTeaser",
      title: "Teaser Section «Bio»",
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
      name: "bioPhoto",
      title: "Foto Bio-Teaser",
      description: "Porträtfoto, das im rechten Panel des Bio-Abschnitts auf der Startseite erscheint",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt-Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "aboutButtonText",
      title: "Text Button «Bio»",
      description: "Text des «Mehr erfahren»-Buttons im Bio-Abschnitt",
      type: "string",
      initialValue: "Mehr erfahren",
    }),
    defineField({
      name: "contactSectionLabel",
      title: "Subtitle Section «Contact»",
      description: "Kleiner roter Text über dem Kontakt-Titel auf der Startseite",
      type: "string",
      initialValue: "Kontakt",
    }),
    defineField({
      name: "contactTitle",
      title: "Header Section «Contact»",
      description: "Grosser Titel im Kontaktabschnitt",
      type: "string",
    }),
    defineField({
      name: "contactSubtitle",
      title: "Teaser Section «Contact»",
      description: "Kurzer Beschreibungstext unter dem Kontakttitel",
      type: "string",
    }),
    defineField({
      name: "contactEmail",
      title: "E-Mail",
      description: "E-Mail-Adresse, die im Kontaktabschnitt als Link angezeigt wird",
      type: "string",
    }),
    defineField({
      name: "contactPhone",
      title: "Phone",
      description: "Telefonnummer, die im Kontaktabschnitt als Link angezeigt wird",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
