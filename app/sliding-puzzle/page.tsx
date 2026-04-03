import type { Metadata } from "next";
import SlidingPuzzle from "../components/SlidingPuzzle";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Sliding Puzzle - Classic 15-Puzzle Game | PlayMini",
  description:
    "Free online 15-puzzle sliding game. Arrange numbered tiles from 1 to 15 by sliding them into the empty space. Classic brain teaser!",
  keywords:
    "sliding puzzle, 15 puzzle, tile puzzle, logic game, brain teaser, puzzle game, free online game",
  alternates: {
    canonical: "/sliding-puzzle",
  },
  openGraph: {
    title: "Sliding Puzzle - Classic 15-Puzzle Game | PlayMini",
    description:
      "Play free sliding puzzle online. Arrange tiles 1-15 by sliding them into order!",
    type: "website",
    url: "https://playmini.fun/sliding-puzzle",
  },
};

export default function SlidingPuzzlePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Sliding Puzzle</h1>
        <p className="text-gray-400">Arrange the tiles from 1 to 15</p>
      </div>

      <SlidingPuzzle />

      {/* How to Play section */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click on any tile adjacent to the empty space</li>
              <li>The tile will slide into the empty space</li>
              <li>Continue sliding tiles until they're in order</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Arrange all tiles in numerical order from 1 to 15</li>
              <li>The empty space should be in the bottom-right corner</li>
              <li>Complete the puzzle as quickly as possible</li>
              <li>Minimize your number of moves</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Solve the top rows first, then work your way down</li>
              <li>The last row is the trickiest - take your time</li>
              <li>Plan several moves ahead to avoid getting stuck</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Sliding Puzzle */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-green-400">About Sliding Puzzle</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            The 15-puzzle, also known as the Sliding Puzzle, was invented in 1874 and became a worldwide craze in the 1880s. It's one of the most famous sliding tile puzzles.
          </p>
          <p>
            The puzzle consists of 15 numbered squares arranged in a 4x4 grid with one space empty. The goal is to arrange the tiles in numerical order by sliding them one at a time into the empty space.
          </p>
          <p>
            While it looks simple, the 15-puzzle is a challenging logic game that tests your spatial reasoning and planning skills. Every random configuration has a 50% chance of being solvable - all puzzles in this game are guaranteed to be solvable!
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
                name: "How do I move tiles in the sliding puzzle?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Click on any tile that is adjacent to the empty space (above, below, left, or right). The tile will slide into the empty space.",
                },
              },
              {
                "@type": "Question",
                name: "What's the goal of the 15-puzzle?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Arrange all numbered tiles in order from 1 to 15, reading left to right, top to bottom. The empty space should end up in the bottom-right corner.",
                },
              },
              {
                "@type": "Question",
                name: "Are all sliding puzzles solvable?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, only about 50% of random configurations are solvable. However, all puzzles generated in this game are guaranteed to be solvable!",
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

      <MoreGames />
    </main>
  );
}
