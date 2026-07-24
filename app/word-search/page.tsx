import type { Metadata } from "next";
import WordSearchPlay from "./WordSearchPlay";

export const metadata: Metadata = {
  title: "Play Word Search Online Free - Puzzle Game | PlayMini",
  description:
    "Play Word Search online free! Find hidden words in letter grids, 3 difficulty levels. Classic word puzzle game in browser. No download, works on mobile and desktop.",
  keywords:
    "word search, word find, word puzzle, free word search, online word search, vocabulary game, puzzle game",
  alternates: {
    canonical: "/word-search",
  },
  openGraph: {
    title: "Play Word Search Online Free - Puzzle Game | PlayMini",
    description:
      "Play Word Search online free! Find hidden words in letter grids, 3 difficulty levels. Classic word puzzle game in browser. No download, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/word-search",
  },
};

export default function WordSearchPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">Find all the hidden words in the grid</p>
      </div>
        <WordSearchPlay />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Word Search Game",
            description:
              "Free online word search puzzle game with multiple difficulty levels and timed challenges.",
            url: "https://playmini.fun/word-search",
            applicationCategory: "Game",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            browserRequirements: "Requires JavaScript. Works on all modern browsers.",
          }),
        }}
      />
    </main>
  );
}
