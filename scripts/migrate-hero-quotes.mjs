/**
 * Migration: copy heroQuotes from homepage-singleton → hero-zitate-singleton
 * Run once: node scripts/migrate-hero-quotes.mjs
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  // 1. Read heroQuotes from the homepage singleton
  const homepage = await client.fetch(
    `*[_id == "homepage-singleton"][0]{ heroQuotes }`
  );

  if (!homepage) {
    console.log("❌ homepage-singleton not found in Sanity.");
    process.exit(1);
  }

  const quotes = homepage.heroQuotes;

  if (!quotes || quotes.length === 0) {
    console.log("ℹ️  No heroQuotes found on homepage-singleton. Nothing to migrate.");
    process.exit(0);
  }

  console.log(`✅ Found ${quotes.length} quote(s) on homepage-singleton.`);

  // 2. Check if hero-zitate-singleton already has quotes
  const existing = await client.fetch(
    `*[_id == "hero-zitate-singleton"][0]{ heroQuotes }`
  );

  if (existing?.heroQuotes?.length > 0) {
    console.log(`⚠️  hero-zitate-singleton already has ${existing.heroQuotes.length} quote(s). Skipping to avoid overwrite.`);
    console.log("    Delete them in Studio first if you want to re-run this migration.");
    process.exit(0);
  }

  // 3. Create or patch hero-zitate-singleton with the quotes
  await client.createOrReplace({
    _id: "hero-zitate-singleton",
    _type: "hero-zitate",
    heroQuotes: quotes,
  });

  console.log(`✅ Migrated ${quotes.length} quote(s) to hero-zitate-singleton.`);
  console.log("   You can now remove the heroQuotes field from homepage-singleton via Studio if desired.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
