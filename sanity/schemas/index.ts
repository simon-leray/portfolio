import { articleSchema } from "./article";
import { aboutSchema } from "./about";
import { homepageSchema } from "./homepage";
import { dossierSchema } from "./dossier";
import { contactSchema } from "./contact";
import { mediumSchema } from "./medium";

export const schemaTypes = [articleSchema, dossierSchema, mediumSchema, aboutSchema, homepageSchema, contactSchema];
