import type { Metadata } from "next";
import Connect4Play from "./Connect4Play";

export const metadata: Metadata = {
  title: "Play Connect 4 Online Free - Four in a Row | PlayMini",
  description:
    "Play Connect 4 online free! Challenging minimax AI plus two-player mode. Drop pieces and connect four in a row. Browser-based, no download needed.",
  keywords:
    "connect 4, connect four, free connect 4, online board game, strategy game, connect 4 vs ai, four in a row",
  alternates: {
    canonical: "/connect4",
  },
  openGraph: {
    title: "Play Connect 4 Online Free - Four in a Row | PlayMini",
    description:
      "Play Connect 4 online free! Challenging minimax AI plus two-player mode. Drop pieces and connect four in a row. Browser-based, no download needed.",
    type: "website",
    url: "https://playmini.fun/connect4",
  },
};

export default function Connect4Page() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Drop your pieces and connect four in a row to win. Play a challenging minimax AI or two-player.
          </p>
        </div>

        {/* Game */}
        <Connect4Play />

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
      </div>
    </main>
  );
}
