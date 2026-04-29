import type { Metadata } from "next";
import BlockDropPlay from "./BlockDropPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Block Drop Online Free - Tetris-style Game | PlayMini",
  description:
    "Play Block Drop online free! Stack falling blocks, clear lines, beat your high score. Classic puzzle game with 7 pieces. Browser-based, works on mobile and desktop.",
  keywords:
    "block drop, falling blocks, block puzzle, tetris clone, puzzle game, online games, free games, stack blocks, line clear game",
  alternates: {
    canonical: "/block-drop",
  },
  openGraph: {
    title: "Play Block Drop Online Free - Tetris-style Game | PlayMini",
    description:
      "Play Block Drop online free! Stack falling blocks, clear lines, beat your high score. Classic puzzle game with 7 pieces. Browser-based, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/block-drop",
  },
};

export default function BlockDropPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Stack the falling blocks, clear lines, and climb the levels in this addictive puzzle game!
          </p>
        </div>

        {/* Game */}
        <BlockDropPlay />

        {/* How to Play */}
        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Left/Right Arrow:</strong> Move block left or right</li>
                <li><strong>Up Arrow:</strong> Rotate block clockwise</li>
                <li><strong>Down Arrow:</strong> Soft drop (move down faster)</li>
                <li><strong>Space:</strong> Hard drop (instantly drop to bottom)</li>
                <li><strong>P or Escape:</strong> Pause/resume game</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use the on-screen buttons below the game</li>
                <li>Left/Right arrows to move</li>
                <li>Rotate button to spin the block</li>
                <li>Drop button to hard drop</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Game Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Stack falling blocks to create complete horizontal lines</li>
                <li>Complete lines disappear and earn you points</li>
                <li>Clear multiple lines at once for bonus points (1 line = 100, 2 = 300, 3 = 500, 4 = 800)</li>
                <li>Level increases every 10 lines cleared</li>
                <li>Blocks fall faster as you level up</li>
                <li>Game ends when blocks reach the top</li>
                <li>The ghost piece shows where your block will land</li>
              </ul>
            </div>
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
                  name: "How do I control the blocks in Block Drop?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "On desktop, use the arrow keys: Left/Right to move, Up to rotate, Down to soft drop, and Space for hard drop. On mobile, use the on-screen buttons below the game. Press P or Escape to pause.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does scoring work in Block Drop?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You earn points by clearing lines: 100 points for 1 line, 300 for 2 lines, 500 for 3 lines, and 800 for 4 lines (Tetris). Your level increases every 10 lines cleared, and the game gets faster with each level.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the ghost piece in Block Drop?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The ghost piece is a semi-transparent preview that shows exactly where your current block will land if you drop it straight down. This helps you plan your placement and play more strategically.",
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
              name: "Block Drop",
              description:
                "Play the classic falling block puzzle game free online with smooth controls and high score tracking.",
              url: "https://playmini.fun/block-drop",
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
