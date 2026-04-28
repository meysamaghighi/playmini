import type { Metadata } from "next";
import ReversiPlay from "./ReversiPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Reversi / Othello Online Free vs Computer | PlayMini",
  description:
    "Play Reversi (Othello) online free against the computer. Flip your opponent's pieces and control the board. No download, no sign-up.",
  keywords: [
    "reversi online",
    "othello online free",
    "play reversi vs computer",
    "reversi browser game",
    "othello game online",
    "reversi no download",
    "othello vs ai",
    "reversi unblocked",
    "board game online",
    "reversi strategy game",
  ],
  alternates: { canonical: "/reversi" },
  openGraph: {
    title: "Play Reversi / Othello Free vs Computer | PlayMini",
    description: "Flip pieces, dominate the board. Reversi vs AI in your browser.",
    type: "website",
    url: "https://playmini.fun/reversi",
  },
};

export default function ReversiPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Outflank your opponent and flip their pieces. Most discs at the end wins.
          </p>
        </div>
        <ReversiPlay />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You play Black — you go first</li>
                <li>Place a disc to sandwich one or more of the opponent&apos;s discs — they flip to your colour</li>
                <li>You must make a move that flips at least one disc; if you can&apos;t, your turn is skipped</li>
                <li>Game ends when neither player can move — most discs wins</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Strategy</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Corners are the most valuable squares — they can never be flipped</li>
                <li>Avoid squares adjacent to empty corners — they let your opponent grab the corner</li>
                <li>Control edges early; minimise your opponent&apos;s moves</li>
              </ul>
            </div>
          </div>
        </section>

        <MoreGames />
      </div>
    </main>
  );
}
