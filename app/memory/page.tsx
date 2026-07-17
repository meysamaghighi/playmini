import type { Metadata } from "next";
import MemoryPlay from "./MemoryPlay";

export const metadata: Metadata = {
  title: "Play Memory Match Online Free - Card Game | PlayMini",
  description:
    "Play Memory Match online free! Flip cards to find matching pairs. Three difficulty levels, timer, fewest-moves best score saved. No download needed.",
  keywords:
    "memory match, memory game, card flip game, matching game, concentration game, brain game, memory test, online memory game, free memory game",
  alternates: {
    canonical: "/memory",
  },
  openGraph: {
    title: "Play Memory Match Online Free - Card Game | PlayMini",
    description:
      "Play Memory Match online free! Flip cards to find matching pairs. Three difficulty levels, timer, fewest-moves best score saved. No download needed.",
    type: "website",
    url: "https://playmini.fun/memory",
  },
};

export default function MemoryMatchPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Flip cards to find matching pairs. Test your memory and complete the puzzle in the fewest moves!
          </p>
        </div>

        {/* Game */}
        <MemoryPlay />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Memory Match Game",
              description:
                "Free online memory card matching game with three difficulty levels. Test your memory and concentration skills.",
              url: "https://playmini.fun/memory",
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
