import type { Metadata } from "next";
import WordSearchGame from "../components/WordSearchGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Word Search - Find Hidden Words | PlayMini",
  description:
    "Free online word search puzzle game. Find hidden words in a letter grid across three difficulty levels. Challenge your vocabulary and pattern recognition skills!",
  keywords:
    "word search, word find, word puzzle, free word search, online word search, vocabulary game, puzzle game",
  openGraph: {
    title: "Word Search - Find Hidden Words | PlayMini",
    description:
      "Play free word search puzzles online. Find hidden words in the grid with multiple difficulty levels.",
    type: "website",
    url: "https://playmini.fun/word-search",
  },
};

export default function WordSearchPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Word Search</h1>
        <p className="text-gray-400">Find all the hidden words in the grid</p>
      </div>

      <WordSearchGame />

      {/* How to Play */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Drag across letters to select a word</li>
              <li>Words can be horizontal, vertical, or diagonal</li>
              <li>Words can also be spelled backwards</li>
              <li>Release to check if your selection matches a word</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Find all words from the list on the right</li>
              <li>Words turn green when found</li>
              <li>Complete all words as fast as possible</li>
              <li>Beat your personal best time!</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Word Search */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-green-400">About Word Search</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Word Search, also known as Word Find, is a classic puzzle game that challenges your vocabulary and pattern recognition skills. Words are hidden in a grid of letters, running horizontally, vertically, or diagonally in any direction.
          </p>
          <p>
            This version offers three difficulty levels with different grid sizes and word lengths. Easy mode features simple 3-letter words in a 10x10 grid, while hard mode challenges you with longer words in a 15x15 grid.
          </p>
          <p>
            Word search puzzles are excellent for improving concentration, vocabulary, and visual scanning abilities. Challenge yourself to beat your best times!
          </p>
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I play Word Search?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Drag your mouse or finger across letters to select them. Words can be horizontal, vertical, or diagonal, and can be spelled forwards or backwards. When you release, if your selection matches a word from the list, it will be marked as found.",
                },
              },
              {
                "@type": "Question",
                name: "What are the difficulty levels?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Easy mode has a 10x10 grid with simple 3-letter words. Medium mode has a 12x12 grid with 5-letter words. Hard mode features a 15x15 grid with longer, more challenging words.",
                },
              },
              {
                "@type": "Question",
                name: "Are words spelled backwards?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Words can be spelled in any direction including forwards and backwards. When you select letters, the game checks both the forward and reverse spelling.",
                },
              },
            ],
          }),
        }}
      />

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

      <MoreGames />
    </main>
  );
}
