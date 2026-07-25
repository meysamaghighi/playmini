import type { Metadata } from "next";
import SolitairePlay from "./SolitairePlay";

export const metadata: Metadata = {
  title: "Play Solitaire Online Free - Klondike Card Game | PlayMini",
  description:
    "Play Solitaire online free! Classic Klondike card game — build four foundations A to K by suit. Browser-based, no download required.",
  keywords:
    "solitaire, klondike, card game, patience, free solitaire, online card game, classic solitaire",
  alternates: {
    canonical: "/solitaire",
  },
  openGraph: {
    title: "Play Solitaire Online Free - Klondike Card Game | PlayMini",
    description:
      "Play Solitaire online free! Classic Klondike card game — build four foundations A to K by suit. Browser-based, no download required.",
    type: "website",
    url: "https://playmini.fun/solitaire",
  },
};

export default function SolitairePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">Classic Klondike patience card game</p>
      </div>
        <SolitairePlay />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Solitaire Game",
            description:
              "Free online Klondike Solitaire card game. Build foundations by suit in this classic patience game.",
            url: "https://playmini.fun/solitaire",
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
    </main>
  );
}
