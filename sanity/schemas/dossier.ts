import { defineField, defineType } from "sanity";

export const dossierSchema = defineType({
  name: "dossier",
  title: "Dossier",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Beschreibung",
      type: "text",
      rows: 3,
      description: "Kurze Einleitung zum Dossier (optional).",
    }),
    defineField({
      name: "articles",
      title: "Artikel",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      description: "Artikel in der gewünschten Reihenfolge hinzufügen.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ?? "Kein Beschreibungstext" };
    },
  },
  orderings: [
    {
      title: "Titel A–Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
