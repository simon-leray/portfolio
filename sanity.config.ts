import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

const SINGLETON_ID = "homepage-singleton";

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
            S.divider(),
            // All other document types except the singleton
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== "homepage"
            ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
