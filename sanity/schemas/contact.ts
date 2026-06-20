import { defineField, defineType } from "sanity";

export const contactSchema = defineType({
  name: "contact",
  title: "Kontakt-Seite",
  type: "document",
  fields: [
    defineField({
      name: "pageLabel",
      title: "Seiten-Label",
      description: "Kleiner roter Text über dem Titel (z. B. «Schreiben Sie mir»)",
      type: "string",
      initialValue: "Schreiben Sie mir",
    }),
    defineField({
      name: "pageTitle",
      title: "Seitentitel",
      description: "Grosser Titel der Kontaktseite",
      type: "string",
      initialValue: "Kontakt",
    }),
    defineField({
      name: "introText",
      title: "Einleitungstext",
      description: "Kurzer Absatz unter dem Titel",
      type: "text",
      rows: 3,
      initialValue:
        "Für Anfragen, Hinweise, Zusammenarbeit oder einfach ein Gespräch — ich freue mich über Ihre Nachricht.",
    }),
    defineField({
      name: "locationLabel",
      title: "Standort-Label",
      description: "Bezeichnung für die Standortzeile",
      type: "string",
      initialValue: "Standort",
    }),
    defineField({
      name: "locationValue",
      title: "Standort",
      type: "string",
      initialValue: "Biel/Bienne, Schweiz",
    }),
    defineField({
      name: "mediaLabel",
      title: "Medien-Label",
      description: "Bezeichnung für die Medienliste",
      type: "string",
      initialValue: "Medien",
    }),
    defineField({
      name: "mediaItems",
      title: "Medien",
      description: "Medien, für die Sie tätig sind",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      initialValue: ["Bieler Tagblatt", "ajour.ch"],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Kontakt-Seite" };
    },
  },
});
