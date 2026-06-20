import { articleSchema } from "./article";
import { aboutSchema } from "./about";
import { homepageSchema } from "./homepage";
import { dossierSchema } from "./dossier";
import { contactSchema } from "./contact";
import { texteSeiteSchema } from "./texteSeite";
import { heroZitateSchema } from "./heroZitate";

export const schemaTypes = [
  articleSchema,
  dossierSchema,
  aboutSchema,
  homepageSchema,
  contactSchema,
  texteSeiteSchema,
  heroZitateSchema,
];
