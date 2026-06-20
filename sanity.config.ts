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
            // ── Seiten ─────────────────────────────────────────────────────────
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
              .title("Texte-Seite")
              .id("texte-seite")
              .child(
                S.document()
                  .schemaType("texte-seite")
                  .documentId(TEXTE_SEITE_ID)
                  .title("Texte-Seite")
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
            // ── Inhalte ────────────────────────────────────────────────────────
            S.documentTypeListItem("article").title("Artikel"),
            S.documentTypeListItem("dossier").title("Dossiers"),
            S.divider(),
            // ── Hero ───────────────────────────────────────────────────────────
            S.listItem()
              .title("Hero-Zitate")
              .id("hero-zitate")
              .child(
                S.document()
                  .schemaType("hero-zitate")
                  .documentId(HERO_ZITATE_ID)
                  .title("Hero-Zitate")
              ),
            S.divider(),
            // ── Remaining types ────────────────────────────────────────────────
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
