import type { Metadata } from "next";
import CrosswordGame from "../components/CrosswordGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Crossword Puzzle - Free Online | PlayMini",
  description:
    "Play free crossword puzzles online. Solve clues, fill in words, and test your vocabulary and general knowledge. New puzzles available every time you play!",
  keywords:
    "crossword puzzle, free crossword, online crossword, word game, brain game, vocabulary game, crossword solver",
  openGraph: {
    title: "Crossword Puzzle - Free Online | PlayMini",
    description:
      "Play free crossword puzzles online. Solve clues, fill in words, and test your vocabulary and general knowledge.",
    type: "website",
    url: "https://playmini.fun/crossword",
  },
};

export default function CrosswordPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            Crossword Puzzle
          </h1>
          <p className="text-gray-300 text-lg">
            Solve clues to fill in the grid. Test your vocabulary and knowledge across various topics!
          </p>
        </div>

        {/* Game */}
        <CrosswordGame />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click a cell to select it and see the clue</li>
                <li>Type letters to fill in the selected cell</li>
                <li>Click the same cell again to toggle between Across and Down</li>
                <li>Use arrow keys to navigate the grid</li>
                <li>Press Backspace or Delete to erase letters</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tap a cell to select it</li>
                <li>Use your device keyboard to type letters</li>
                <li>Tap the same cell again to change direction</li>
                <li>The current clue is shown at the top of the grid</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Game Features:</h3>
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
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">About Crossword Puzzles</h2>
          <div className="text-gray-300 space-y-3">
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

        <MoreGames />
      </div>
    </main>
  );
}
