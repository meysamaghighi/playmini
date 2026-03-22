import type { Metadata } from "next";
import Connect4Game from "../components/Connect4Game";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Connect 4 - Free Online | PlayMini",
  description:
    "Play Connect 4 free online against AI. Drop your pieces, connect four in a row, and beat the computer. Classic strategy game for desktop and mobile.",
  keywords:
    "connect 4, connect four, free connect 4, online board game, strategy game, connect 4 vs ai, four in a row",
  openGraph: {
    title: "Connect 4 - Free Online | PlayMini",
    description:
      "Play Connect 4 free online against AI. Drop your pieces, connect four in a row, and beat the computer.",
    type: "website",
    url: "https://playmini.fun/connect4",
  },
};

export default function Connect4Page() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-yellow-500 bg-clip-text text-transparent">
            Connect 4
          </h1>
          <p className="text-gray-300 text-lg">
            Drop your pieces and connect four in a row to win! Play against a challenging AI opponent.
          </p>
        </div>

        {/* Game */}
        <Connect4Game />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-red-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click on any column to drop your red piece</li>
                <li>Hover over columns to preview your move</li>
                <li>The piece will drop to the lowest available position</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You play as Red, the AI plays as Yellow</li>
                <li>Take turns dropping pieces into the 7-column grid</li>
                <li>Connect four pieces vertically, horizontally, or diagonally to win</li>
                <li>The AI uses advanced strategy to challenge you</li>
                <li>If the board fills up with no winner, it's a draw</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Strategy Tips:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Control the center columns for more winning opportunities</li>
                <li>Look for ways to create multiple winning threats at once</li>
                <li>Block the AI when it has three in a row</li>
                <li>Think several moves ahead to trap your opponent</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Connect 4 */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-red-400">About Connect 4</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Connect 4, also known as Four in a Row or Captain's Mistress, is a classic two-player connection board game. First launched commercially in 1974, it has become one of the most popular strategy games worldwide.
            </p>
            <p>
              The game is simple to learn but offers deep strategic depth. Players must balance offensive play (setting up their own winning connections) with defensive play (blocking their opponent's threats). Advanced players can plan several moves ahead to create unstoppable winning positions.
            </p>
            <p>
              This online version features a challenging AI opponent that uses minimax algorithm with alpha-beta pruning to make intelligent moves. The AI evaluates board positions, recognizes patterns, and plans ahead to provide a worthy challenge. Can you outsmart the computer?
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
                  name: "How do I play Connect 4?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click on any of the seven columns to drop your red piece. The piece falls to the lowest available position in that column. Connect four of your pieces vertically, horizontally, or diagonally to win. You alternate turns with the AI opponent (yellow pieces).",
                  },
                },
                {
                  "@type": "Question",
                  name: "How hard is the AI opponent?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The AI uses a minimax algorithm with alpha-beta pruning, searching 5 moves ahead. It recognizes patterns, evaluates positions, and makes strategic decisions. The AI provides a challenging experience for most players while still being beatable with good strategy.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are good Connect 4 strategies?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Focus on controlling the center columns as they offer more winning possibilities. Try to create multiple threats simultaneously to force your opponent into difficult choices. Always block when your opponent has three in a row. Think ahead to set up winning combinations that can't be stopped.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does the game track my stats?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The game tracks your wins, losses, and draws locally in your browser. Your stats are saved automatically and persist across sessions so you can track your progress over time.",
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
              name: "Connect 4",
              description:
                "Play Connect 4 free online against AI with intelligent moves and strategy.",
              url: "https://playmini.fun/connect4",
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
