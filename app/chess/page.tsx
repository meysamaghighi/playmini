import type { Metadata } from "next";
import ChessGame from "../components/ChessGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Chess Online Free vs Computer | PlayMini",
  description:
    "Play chess online free against the computer. Full chess rules: castling, en passant, promotion. No download, no sign-up. Desktop and mobile friendly.",
  keywords: [
    "chess online free",
    "play chess vs computer",
    "chess browser game",
    "chess no download",
    "free chess game online",
    "chess unblocked",
    "chess vs ai",
    "chess computer opponent",
    "online chess game",
    "chess mobile browser",
  ],
  alternates: { canonical: "/chess" },
  openGraph: {
    title: "Play Chess Online Free vs Computer | PlayMini",
    description: "Full chess vs AI — castling, en passant, promotion. No download needed.",
    type: "website",
    url: "https://playmini.fun/chess",
  },
};

export default function ChessPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Chess
          </h1>
          <p className="text-ink-2 text-lg">
            Play chess against the computer. You play White — click a piece, then click where to move.
          </p>
        </div>

        <ChessGame />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Click or tap a white piece to select it — legal moves appear as dots</li>
                <li>Click or tap a highlighted square to move</li>
                <li>Click another white piece to change your selection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You play White, the AI plays Black</li>
                <li>Castling, en passant, and promotion (auto-queens) are all supported</li>
                <li>Checkmate or stalemate ends the game</li>
              </ul>
            </div>
          </div>
        </section>

        <MoreGames />
      </div>
    </main>
  );
}
