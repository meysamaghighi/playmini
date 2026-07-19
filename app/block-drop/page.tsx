import type { Metadata } from "next";
import BlockDropPlay from "./BlockDropPlay";

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
      </div>
    </main>
  );
}
