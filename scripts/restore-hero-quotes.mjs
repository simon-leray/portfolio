/**
 * Restores heroQuotes into the hero-zitate-singleton document.
 * Run: node scripts/restore-hero-quotes.mjs
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function key() {
  return Math.random().toString(36).slice(2, 12);
}

const quotes = [
  { quote: "Das Asylzentrum Twannberg sieht aus wie ein Freizeitpark der Achtzigerjahre, gebaut für eine bessere Zukunft, die nie ganz kam.", source: "Willkommen auf dem Twannberg" },
  { quote: "Liegt die wirkliche Wildnis also nicht in Patagonien und Alaska, sondern zwischen ‹Flugmodus ein› und ‹Flugmodus aus›?", source: "Was kommt hinter dem Horizont?" },
  { quote: "Man nennt das auch Stockholm-Syndrom. Oder Liebe. Die Grenze verläuft fliessend.", source: "Ein Fan, zwei Klubs, null Lösung" },
  { quote: "Was fehlt, ist die Anerkennung, dass Statistik und Alltagserfahrung auseinanderklaffen können, ohne dass eine Seite lügt.", source: "Das Problem sind nicht die Parkplätze" },
  { quote: "Wer die Neptunbrücke abreissen will, nimmt der Stadt ein Stück kollektive Erinnerung.", source: "Lasst die Finger von diesem Brüggli" },
  { quote: "Man kann nicht gleichzeitig bezahlbare Mieten fordern und gegen jede Überbauung protestieren.", source: "Die Bözingen-Projekte sind gute Deals" },
  { quote: "Die Idealvorstellung, dass Demokratie immer sauber, klar und frei von Irritationen ist, ist naiv.", source: "Das System nervt – gut so!" },
  { quote: "Das Wort ‹Tot› kann man nicht steigern. Toter als tot sein, das geht nicht. Ausser man spricht von der Bieler Marktgasse.", source: "Das Bieler Lädelisterben" },
  { quote: "Was bleibt, sind Fragen. Und Wahlplakate.", source: "Kummers Rückzug bereitet Kummer" },
  { quote: "‹Friss oder stirb› ist selten ein gutes Prinzip in einer Demokratie.", source: "Es gibt keine Alternative" },
  { quote: "Ein legitimes Anliegen verschwindet hinter organisatorischem Chaos. Und das ist furchtbar schade.", source: "Die Demo in Biel war ein Eigentor aller Beteiligten" },
  { quote: "Es muss mal gesagt werden: Die meisten Baustellenwände sind doof.", source: "Baustellenpoesie" },
  { quote: "Draussen knallen Feuerwerkskörper. Drinnen schenkt Milene gesponserten Rimuss in Plastikflûtes.", source: "Eine Nacht mit den Bieler Rotnasen" },
  { quote: "Mit der Kanalisation hat es angefangen, mit einem Kanton aufgehört.", source: "«Ich bin ein Mensch, der eine Bühne braucht»" },
].map((q) => ({ _type: "heroQuote", _key: key(), ...q }));

async function run() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ SANITY_API_TOKEN is not set in .env.local");
    process.exit(1);
  }

  await client.createOrReplace({
    _id: "hero-zitate-singleton",
    _type: "hero-zitate",
    heroQuotes: quotes,
  });

  console.log(`✅ Wrote ${quotes.length} quotes to hero-zitate-singleton.`);
}

run().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
