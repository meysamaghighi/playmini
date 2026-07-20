import type { Metadata } from "next";
import CrosswordPlay from "./CrosswordPlay";

export const metadata: Metadata = {
  title: "Play Crossword Puzzle Online Free - Word Game | PlayMini",
  description:
    "Play Crossword Puzzle online free! Solve clues, fill in words, test your vocabulary. New puzzles generated every time. Browser-based word game, no download.",
  keywords:
    "crossword puzzle, free crossword, online crossword, word game, brain game, vocabulary game, crossword solver",
  alternates: {
    canonical: "/crossword",
  },
  openGraph: {
    title: "Play Crossword Puzzle Online Free - Word Game | PlayMini",
    description:
      "Play Crossword Puzzle online free! Solve clues, fill in words, test your vocabulary. New puzzles generated every time. Browser-based word game, no download.",
    type: "website",
    url: "https://playmini.fun/crossword",
  },
};

export default function CrosswordPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Solve clues to fill in the grid. Test your vocabulary and knowledge across various topics!
          </p>
        </div>

        {/* Game */}
        <CrosswordPlay />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Crossword Puzzle",
              description:
                "Play free online crossword puzzles with technology and programming themes. Test your vocabulary and problem-solving skills.",
              url: "https://playmini.fun/crossword",
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
      </div>
    </main>
  );
}
