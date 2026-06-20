import { defineField, defineType } from "sanity";

export const heroZitateSchema = defineType({
  name: "hero-zitate",
  title: "Hero-Zitate",
  type: "document",
  fields: [
    defineField({
      name: "heroQuotes",
      title: "Zitate",
      description: "Sätze, die im Hintergrund des Hero-Bereichs langsam von rechts nach links driften. Reihenfolge und Anzahl sind frei wählbar.",
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
          ],
          preview: {
            select: { title: "quote", subtitle: "source" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Hero-Zitate" };
    },
  },
});
