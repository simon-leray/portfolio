import { defineField, defineType } from "sanity";

export const aboutSchema = defineType({
  name: "about",
  title: "Über mich",
  type: "document",
  fields: [
    defineField({
      name: "pageTitle",
      title: "Seitentitel",
      description: "Grosser Titel der Über-mich-Seite",
      type: "string",
      initialValue: "Über mich",
    }),
    defineField({
      name: "pageSubtitle",
      title: "Seiten-Untertitel",
      description: "Kleiner roter Text über dem Titel (z. B. «Journalist»)",
      type: "string",
      initialValue: "Journalist",
    }),
    defineField({
      name: "contactButtonText",
      title: "Button-Text",
      description: "Beschriftung des «Kontakt»-Buttons am Ende der Seite",
      type: "string",
      initialValue: "Kontakt aufnehmen",
    }),
    defineField({
      name: "location",
      title: "Standort",
      type: "string",
      initialValue: "Biel/Bienne, Schweiz",
    }),
    defineField({
      name: "media",
      title: "Medien",
      description: "Medien, für die Sie tätig sind",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      initialValue: ["Bieler Tagblatt", "ajour.ch"],
    }),
    defineField({
      name: "photo",
      title: "Foto",
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
      name: "bio",
      title: "Biografie",
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
  ],
  preview: {
    select: { media: "photo" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(value: any) {
      return { title: "Über mich", media: value.media };
    },
  },
});
