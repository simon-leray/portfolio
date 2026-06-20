import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

const SINGLETON_ID = "homepage-singleton";
const ABOUT_ID = "about-singleton";
const CONTACT_ID = "contact-singleton";

export default defineConfig({
  name: "leray-portfolio",
  title: "Leray Portfolio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalt")
          .items([
            // Singleton: opens the document directly, no list or new/delete
            S.listItem()
              .title("Homepage")
              .id("homepage")
              .child(
                S.document()
                  .schemaType("homepage")
                  .documentId(SINGLETON_ID)
                  .title("Homepage")
              ),
            S.listItem()
              .title("Über mich")
              .id("about")
              .child(
                S.document()
                  .schemaType("about")
                  .documentId(ABOUT_ID)
                  .title("Über mich")
              ),
            S.listItem()
              .title("Kontakt-Seite")
              .id("contact")
              .child(
                S.document()
                  .schemaType("contact")
                  .documentId(CONTACT_ID)
                  .title("Kontakt-Seite")
              ),
            S.divider(),
            // Primary content types
            S.documentTypeListItem("article").title("Artikel"),
            S.documentTypeListItem("dossier").title("Dossiers"),
            S.divider(),
            // Remaining types (any future additions)
            ...S.documentTypeListItems().filter(
              (item) => !["homepage", "about", "contact", "article", "dossier"].includes(item.getId() ?? "")
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
