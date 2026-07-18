import type { Metadata } from "next";
import MinesweeperPlay from "./MinesweeperPlay";

export const metadata: Metadata = {
  title: "Minesweeper Game Online Free - Classic Logic Puzzle | PlayMini",
  description:
    "Play Minesweeper game online free in your browser! Classic logic puzzle with 3 difficulty levels (Easy, Medium, Hard). Clear all mines to win. No download needed, mobile-friendly.",
  keywords: [
    "minesweeper game online",
    "play minesweeper online free",
    "minesweeper online",
    "minesweeper game",
    "free minesweeper",
    "classic minesweeper",
    "minesweeper game online free",
    "minesweeper unblocked",
    "minesweeper browser game",
  ],
  alternates: {
    canonical: "/minesweeper",
  },
  openGraph: {
    title: "Minesweeper Game Online Free - Classic Logic Puzzle | PlayMini",
    description:
      "Play Minesweeper game online free in your browser! Classic logic puzzle with 3 difficulty levels. Clear all mines to win. No download needed, mobile-friendly.",
    url: "https://playmini.fun/minesweeper",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PlayMini - Free Browser Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Minesweeper Game Online Free - Classic Logic Puzzle",
    description:
      "Play Minesweeper game online free! Classic logic puzzle with 3 difficulty levels. No download, browser-based.",
  },
};

export default function MinesweeperPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Minesweeper",
    description:
      "Play classic Minesweeper online for free with three difficulty levels and personal best tracking.",
    url: "https://playmini.fun/minesweeper",
    applicationCategory: "Game",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
        <MinesweeperPlay />
    </>
  );
}
