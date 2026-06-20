import { defineField, defineType } from "sanity";

export const texteSeiteSchema = defineType({
  name: "texte-seite",
  title: "Texte-Seite",
  type: "document",
  fields: [
    defineField({
      name: "textePageTitle",
      title: "Titel",
      description: "Grosser Titel der /texte-Seite",
      type: "string",
      initialValue: "Texte",
    }),
    defineField({
      name: "textePageSubtitle",
      title: "Untertitel",
      description: "Kleiner roter Text über dem Titel auf der /texte-Seite",
      type: "string",
      initialValue: "Alle Texte",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Texte-Seite" };
    },
  },
});
