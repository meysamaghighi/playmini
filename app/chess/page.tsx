import type { Metadata } from "next";
import ChessPlay from "./ChessPlay";

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
          <p className="text-ink-2 text-lg">
            Play chess against the computer. You play White — click a piece, then click where to move.
          </p>
        </div>
        <ChessPlay />
      </div>
    </main>
  );
}
