import type { Metadata } from "next";
import CheckersPlay from "./CheckersPlay";
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
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Capture all opponent pieces or block their moves to win! Play classic checkers with kings and multi-jump chains.
          </p>
        </div>

        {/* Game */}
        <CheckersPlay />

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
