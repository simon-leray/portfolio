import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Analytics } from "@vercel/analytics/react";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simon Leray – Journalist",
  description:
    "Journalismus aus Biel/Bienne. Reportagen, Interviews und Hintergründe für Bieler Tagblatt und ajour.ch.",
  metadataBase: new URL("https://leray.me"),
  openGraph: {
    title: "Simon Leray – Journalist",
    description:
      "Journalismus aus Biel/Bienne. Reportagen, Interviews und Hintergründe für Bieler Tagblatt und ajour.ch.",
    siteName: "Simon Leray",
    url: "https://leray.me",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simon Leray – Journalist",
    description:
      "Journalismus aus Biel/Bienne. Reportagen, Interviews und Hintergründe für Bieler Tagblatt und ajour.ch.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${bebasNeue.variable} ${playfairDisplay.variable} ${inter.variable}`}
    >
      <body className="bg-paper text-ink">
        <Nav />
        {children}
        <footer className="bg-ink text-paper/40 py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wider">
            <span
              className="text-2xl text-paper"
              style={{ fontFamily: "var(--font-bebas), sans-serif" }}
            >
              SL<span className="text-red">.</span>
            </span>
            <span>© {new Date().getFullYear()} Simon Leray</span>
            <span>Biel/Bienne, Schweiz</span>
            <Link href="/impressum" className="hover:text-paper/70 transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-paper/70 transition-colors">
              Datenschutz
            </Link>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
