import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

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
  title: "Simon Leray — Journalist in Biel/Bienne",
  description:
    "Journalismus aus Biel/Bienne. Reportagen, Interviews und Hintergründe für Bieler Tagblatt und ajour.ch.",
  openGraph: {
    title: "Simon Leray — Journalist in Biel/Bienne",
    description:
      "Journalismus aus Biel/Bienne. Reportagen, Interviews und Hintergründe für Bieler Tagblatt und ajour.ch.",
    siteName: "Simon Leray",
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
      </body>
    </html>
  );
}
