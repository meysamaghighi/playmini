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

        {/* How to Play */}
        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click a cell to select it and see the clue</li>
                <li>Type letters to fill in the selected cell</li>
                <li>Click the same cell again to toggle between Across and Down</li>
                <li>Use arrow keys to navigate the grid</li>
                <li>Press Backspace or Delete to erase letters</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tap a cell to select it</li>
                <li>Use your device keyboard to type letters</li>
                <li>Tap the same cell again to change direction</li>
                <li>The current clue is shown at the top of the grid</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Game Features:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click "Check" to verify your answers (correct answers in green, wrong in red)</li>
                <li>The puzzle is complete when all cells are filled correctly</li>
                <li>Timer tracks your solving speed</li>
                <li>Personal best time is saved automatically</li>
                <li>Click "New Puzzle" to get a different crossword</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Crosswords */}
        <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">About Crossword Puzzles</h2>
          <div className="text-ink-2 space-y-3">
            <p>
              Crossword puzzles are one of the most popular word games in the world. They challenge your vocabulary,
              general knowledge, and problem-solving skills by asking you to fill in a grid based on clever clues.
            </p>
            <p>
              Each puzzle features words that intersect with each other, where shared letters help you solve multiple
              clues at once. The beauty of crosswords lies in the "aha!" moment when you crack a difficult clue or
              use one answer to unlock several others.
            </p>
            <p>
              Our crossword puzzles feature programming and technology themes, making them perfect for developers,
              tech enthusiasts, and anyone interested in computers. From coding languages to networking terms,
              you'll test your tech vocabulary while having fun!
            </p>
            <p>
              Studies have shown that regularly solving crossword puzzles can help improve memory, vocabulary, and
              cognitive function. It's brain training that's actually enjoyable!
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
                  name: "How do I play the crossword puzzle?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click on any white cell in the grid to select it and see its clue. Type letters to fill in the cell. Click the same cell again to toggle between solving across or down. Use arrow keys to navigate, and backspace to erase.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I check if my answers are correct?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Click the 'Check' button to verify your answers. Correct letters will be shown in green, and incorrect ones in red. This helps you find mistakes without revealing all the answers.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I get a new crossword puzzle?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click the 'New Puzzle' button at any time to load a different crossword. Each puzzle is randomly selected from our collection, so you'll get a fresh challenge every time.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my solving time tracked?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! A timer starts when you load the puzzle and stops when you complete it. Your personal best time is saved in your browser, so you can try to beat your own record.",
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
