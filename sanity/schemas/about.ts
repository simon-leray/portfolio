import { defineField, defineType } from "sanity";

export const aboutSchema = defineType({
  name: "about",
  title: "Bio",
  type: "document",
  fields: [
    defineField({
      name: "pageTitle",
      title: "Head",
      description: "Grosser Titel der Bio-Seite",
      type: "string",
      initialValue: "Bio",
    }),
    defineField({
      name: "pageSubtitle",
      title: "Subtitle",
      description: "Kleiner roter Text über dem Titel",
      type: "string",
      initialValue: "Journalist",
    }),
    defineField({
      name: "contactButtonText",
      title: "Button",
      description: "Beschriftung des Buttons am Ende der Seite",
      type: "string",
      initialValue: "Kontakt aufnehmen",
    }),
    defineField({
      name: "contactButtonLink",
      title: "Button — Link",
      description: "Ziel-URL des Buttons (Standard: /kontakt)",
      type: "url",
      validation: (rule) => rule.uri({ allowRelative: true }),
    }),
    defineField({
      name: "location",
      title: "Standorte",
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
      title: "Bio",
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
      return { title: "Bio", media: value.media };
    },
  },
});
