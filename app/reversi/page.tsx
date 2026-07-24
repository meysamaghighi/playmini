import type { Metadata } from "next";
import ReversiPlay from "./ReversiPlay";

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

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Reversi",
              description:
                "Play Reversi (Othello) online free against the computer — flip your opponent's pieces and control the board.",
              url: "https://playmini.fun/reversi",
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
