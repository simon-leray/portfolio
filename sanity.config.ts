import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

const SINGLETON_ID = "homepage-singleton";
const ABOUT_ID = "about-singleton";
const CONTACT_ID = "contact-singleton";
const TEXTE_SEITE_ID = "texte-seite-singleton";
const HERO_ZITATE_ID = "hero-zitate-singleton";

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
            S.listItem()
              .title("Front")
              .id("homepage")
              .child(
                S.document()
                  .schemaType("homepage")
                  .documentId(SINGLETON_ID)
                  .title("Front")
              ),
            S.listItem()
              .title("Texte")
              .id("texte-seite")
              .child(
                S.document()
                  .schemaType("texte-seite")
                  .documentId(TEXTE_SEITE_ID)
                  .title("Texte")
              ),
            S.listItem()
              .title("Bio")
              .id("about")
              .child(
                S.document()
                  .schemaType("about")
                  .documentId(ABOUT_ID)
                  .title("Bio")
              ),
            S.listItem()
              .title("Kontakt")
              .id("contact")
              .child(
                S.document()
                  .schemaType("contact")
                  .documentId(CONTACT_ID)
                  .title("Kontakt")
              ),
            S.divider(),
            S.documentTypeListItem("article").title("Manage Articles"),
            S.documentTypeListItem("dossier").title("Manage Dossiers"),
            S.divider(),
            S.listItem()
              .title("Manage Hero Quotes")
              .id("hero-zitate")
              .child(
                S.document()
                  .schemaType("hero-zitate")
                  .documentId(HERO_ZITATE_ID)
                  .title("Manage Hero Quotes")
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) =>
                ![
                  "homepage",
                  "about",
                  "contact",
                  "article",
                  "dossier",
                  "texte-seite",
                  "hero-zitate",
                ].includes(item.getId() ?? "")
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
