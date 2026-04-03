import type { Metadata } from "next";
import CheckersGame from "../components/CheckersGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Checkers Online Free - vs AI Board Game | PlayMini",
  description:
    "Play Checkers online free! Classic board game vs AI with kings, multi-jumps, mandatory captures. Strategic gameplay in browser. No download, mobile-friendly.",
  keywords:
    "checkers, checkers online, free checkers, checkers vs ai, draughts, board game, strategy game, kings",
  alternates: {
    canonical: "/checkers",
  },
  openGraph: {
    title: "Play Checkers Online Free - vs AI Board Game | PlayMini",
    description:
      "Play Checkers online free! Classic board game vs AI with kings, multi-jumps, mandatory captures. Strategic gameplay in browser. No download, mobile-friendly.",
    type: "website",
    url: "https://playmini.fun/checkers",
  },
};

export default function CheckersPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-gray-500 bg-clip-text text-transparent">
            Checkers
          </h1>
          <p className="text-gray-300 text-lg">
            Capture all opponent pieces or block their moves to win! Play classic checkers with kings and multi-jump chains.
          </p>
        </div>

        {/* Game */}
        <CheckersGame />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-red-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click on any red piece to select it</li>
                <li>Valid moves will be highlighted in green</li>
                <li>Click on a highlighted square to move your piece</li>
                <li>Multi-jump chains happen automatically in one turn</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You play as Red, the AI plays as Black</li>
                <li>Regular pieces move diagonally forward one square</li>
                <li>Jump over opponent pieces to capture them (mandatory)</li>
                <li>Reach the opposite end to become a King (crowned with ♔)</li>
                <li>Kings can move diagonally in all directions</li>
                <li>Win by capturing all opponent pieces or blocking their moves</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Strategy Tips:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Control the center of the board for more mobility</li>
                <li>Protect your back row to prevent opponent kings</li>
                <li>Create multi-jump opportunities to capture multiple pieces</li>
                <li>Kings are powerful - prioritize getting them</li>
                <li>Trade pieces when you're ahead in material</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Checkers */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-red-400">About Checkers</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Checkers, also known as Draughts, is one of the oldest and most popular board games in the world. The game dates back thousands of years, with ancient variations found in Egypt and Mesopotamia. The modern version we play today evolved in France around the 12th century.
            </p>
            <p>
              The game combines simple rules with deep strategic complexity. While anyone can learn the basic moves in minutes, mastering checkers requires understanding positional play, tempo, sacrifice tactics, and endgame theory. World champions study openings and practice for years to achieve mastery.
            </p>
            <p>
              This online version features a challenging AI opponent that uses minimax algorithm with alpha-beta pruning to make intelligent decisions. The AI evaluates board positions, plans multi-jump combinations, and adapts its strategy based on piece advantage. It provides a worthy challenge while remaining beatable with good tactics.
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
                  name: "How do I play Checkers?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click on any red piece to select it. Valid moves will be highlighted in green on the board. Click on a highlighted square to move there. Regular pieces move diagonally forward, while kings (crowned pieces) can move in all diagonal directions. Capture opponent pieces by jumping over them.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are kings in Checkers?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "When a regular piece reaches the opposite end of the board, it becomes a king (shown with a crown ♔). Kings can move diagonally in all four directions, making them much more powerful than regular pieces. Getting kings is a key strategy for winning.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Are captures mandatory in Checkers?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! If you can capture an opponent's piece, you must do so. This is a fundamental rule of checkers. When multiple capture moves are available, you can choose which one to make. Multi-jump chains (capturing multiple pieces in one turn) are also mandatory if available.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How hard is the AI opponent?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The AI uses a minimax algorithm with alpha-beta pruning, searching 5 moves ahead. It evaluates positions, recognizes king advantages, and plans capture combinations. The AI provides a challenging experience that tests your strategic thinking while still being beatable with good tactics.",
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
              name: "Checkers",
              description:
                "Play Checkers free online against AI with kings, multi-jump chains, and mandatory captures.",
              url: "https://playmini.fun/checkers",
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
