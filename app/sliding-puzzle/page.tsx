import type { Metadata } from "next";
import SlidingPuzzlePlay from "./SlidingPuzzlePlay";

export const metadata: Metadata = {
  title: "Play Sliding Puzzle Online Free - 15 Puzzle Game | PlayMini",
  description:
    "Play Sliding Puzzle online free! Arrange tiles 1-15 by sliding into empty space. Classic 15-puzzle brain teaser in browser. No download, mobile-friendly.",
  keywords:
    "sliding puzzle, 15 puzzle, tile puzzle, logic game, brain teaser, puzzle game, free online game",
  alternates: {
    canonical: "/sliding-puzzle",
  },
  openGraph: {
    title: "Play Sliding Puzzle Online Free - 15 Puzzle Game | PlayMini",
    description:
      "Play Sliding Puzzle online free! Arrange tiles 1-15 by sliding into empty space. Classic 15-puzzle brain teaser in browser. No download, mobile-friendly.",
    type: "website",
    url: "https://playmini.fun/sliding-puzzle",
  },
};

export default function SlidingPuzzlePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">Arrange the tiles from 1 to 15</p>
      </div>
        <SlidingPuzzlePlay />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Sliding Puzzle Game",
            description:
              "Free online 15-puzzle sliding game. Arrange numbered tiles in order by sliding them.",
            url: "https://playmini.fun/sliding-puzzle",
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
