import { defineField, defineType } from "sanity";
import { DateInput } from "../components/DateInput";

export const articleSchema = defineType({
  name: "article",
  title: "Artikel",
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
      name: "publishedAt",
      title: "Erscheinungsdatum",
      type: "date",
      components: { input: DateInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "string",
      options: {
        list: [
          { title: "Investigativ", value: "Investigativ" },
          { title: "Porträt", value: "Porträt" },
          { title: "Reportage", value: "Reportage" },
          { title: "Interview", value: "Interview" },
          { title: "Kommentar", value: "Kommentar" },
          { title: "Bericht", value: "Bericht" },
          { title: "Recherche", value: "Recherche" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "outlet",
      title: "Medium / Medien",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Medien, in denen dieser Artikel erschienen ist. Enter drücken um ein Medium hinzuzufügen.",
      initialValue: ["Bieler Tagblatt", "ajour.ch"],
    }),
    defineField({
      name: "excerpt",
      title: "Teaser",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Titelbild",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt-Text",
          type: "string",
        }),
        defineField({
          name: "credit",
          title: "Bildnachweis / Quelle",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "externalUrl",
      title: "Externer Link (optional)",
      type: "url",
      description: "Wenn gesetzt, verweist der Artikel auf diese URL statt auf den vollen Inhalt.",
    }),
    defineField({
      name: "articleTitle",
      title: "Artikeltitel (Detailseite)",
      type: "string",
      description: "Grosser Titel auf der Artikelseite. Falls leer, wird der Vorschautitel verwendet.",
    }),
    defineField({
      name: "lead",
      title: "Lead / Einleitung",
      type: "text",
      rows: 4,
      description: "Einleitungsabsatz, erscheint kursiv zwischen dem Titelbild und dem Artikeltext.",
    }),
    defineField({
      name: "showInTexte",
      title: "Auf Seite «Texte» anzeigen",
      type: "boolean",
      description: "Wenn deaktiviert, erscheint dieser Artikel nur in Dossiers, nicht in der allgemeinen Artikelübersicht.",
      initialValue: true,
    }),
    defineField({
      name: "relatedArticles",
      title: "Verwandte Texte",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      description: "Optional: Bis zu 3 thematisch verwandte Artikel, die am Ende der Seite angezeigt werden.",
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "content",
      title: "Inhalt",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Zwischentitel", value: "zwischentitel" },
            { title: "Zwischentitel farbig", value: "zwischentitelFarbig" },
          ],
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
        {
          name: "imageBlock",
          title: "Bild",
          type: "object",
          fields: [
            { name: "image", type: "image", title: "Bild", options: { hotspot: true } },
            { name: "caption", type: "string", title: "Bildunterschrift" },
            { name: "credit", type: "string", title: "Bildnachweis" },
          ],
          preview: {
            select: { title: "caption", media: "image" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              return { title: value.title || "Bild", media: value.media };
            },
          },
        },
        {
          name: "pullQuote",
          title: "Pull Quote",
          type: "object",
          fields: [
            { name: "quote", type: "text", title: "Zitat" },
            { name: "author", type: "string", title: "Autor (optional)" },
          ],
          preview: {
            select: { title: "quote" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              return { title: `"${value.title}"` };
            },
          },
        },
        {
          name: "infobox",
          title: "Infobox",
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Titel" },
            { name: "text", type: "text", title: "Text" },
          ],
        },
        {
          name: "divider",
          title: "Trennlinie",
          type: "object",
          fields: [{ name: "style", type: "string", title: "Stil", hidden: true, initialValue: "default" }],
          preview: {
            prepare() {
              return { title: "— Trennlinie —" };
            },
          },
        },
        {
          name: "embed",
          title: "Einbettung",
          type: "object",
          fields: [{ name: "url", type: "url", title: "URL (YouTube/Vimeo/Twitter)" }],
          preview: {
            select: { title: "url" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              return { title: `Embed: ${value.title}` };
            },
          },
        },
        {
          name: "iframeBlock",
          title: "iFrame",
          type: "object",
          fields: [
            {
              name: "url",
              type: "url",
              title: "URL",
              validation: (rule: any) => rule.required(),
            },
            {
              name: "height",
              type: "number",
              title: "Höhe (px)",
              initialValue: 500,
            },
            {
              name: "caption",
              type: "string",
              title: "Beschriftung (optional)",
            },
          ],
          preview: {
            select: { title: "url" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              return { title: `iFrame: ${value.title}` };
            },
          },
        },
        {
          name: "imageGallery",
          title: "Bildergalerie",
          type: "object",
          fields: [
            {
              name: "images",
              title: "Bilder",
              type: "array",
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    { name: "alt", type: "string", title: "Alt-Text" },
                    { name: "caption", type: "string", title: "Bildunterschrift" },
                    { name: "credit", type: "string", title: "Bildnachweis / Quelle" },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: { media: "images.0" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              return { title: "Bildergalerie", media: value.media };
            },
          },
        },
        {
          name: "socialEmbed",
          title: "Tweet / Instagram / Facebook",
          type: "object",
          fields: [
            {
              name: "platform",
              title: "Plattform",
              type: "string",
              options: {
                list: [
                  { title: "Twitter / X", value: "twitter" },
                  { title: "Instagram", value: "instagram" },
                  { title: "Facebook", value: "facebook" },
                ],
                layout: "radio",
              },
            },
            {
              name: "embedCode",
              title: "Einbettungscode",
              type: "text",
              rows: 6,
              description: "Vollständiger Einbettungscode von der Plattform einfügen.",
            },
          ],
          preview: {
            select: { title: "platform" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              const labels: Record<string, string> = {
                twitter: "Twitter / X",
                instagram: "Instagram",
                facebook: "Facebook",
              };
              return { title: `Social: ${labels[value.title] ?? value.title ?? "Einbettung"}` };
            },
          },
        },
        {
          name: "videoBlock",
          title: "Video",
          type: "object",
          fields: [
            {
              name: "url",
              type: "url",
              title: "Video-URL (YouTube oder Vimeo)",
              validation: (rule: any) => rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Beschriftung (optional)",
            },
          ],
          preview: {
            select: { title: "url" },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prepare(value: any) {
              return { title: `Video: ${value.title}` };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
  orderings: [
    {
      title: "Datum (neueste zuerst)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
