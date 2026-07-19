import type { Metadata } from "next";
import BubbleShooterPlay from "./BubbleShooterPlay";

export const metadata: Metadata = {
  title: "Play Bubble Shooter Online Free - Match 3 Puzzle | PlayMini",
  description:
    "Play Bubble Shooter online free! Aim, shoot, and match 3 or more bubbles of the same color to pop them. Classic match-3 puzzle, works on mobile and desktop.",
  keywords: [
    "bubble shooter game free online",
    "bubble pop game",
    "bubble shooter online",
    "free bubble shooter",
    "bubble game online",
    "match 3 bubbles",
    "puzzle game online",
    "bubble shooter unblocked",
  ],
  alternates: {
    canonical: "/bubble-shooter",
  },
  openGraph: {
    title: "Play Bubble Shooter Online Free - Match 3 Puzzle | PlayMini",
    description:
      "Play Bubble Shooter online free! Aim, shoot, and match 3 or more bubbles of the same color to pop them.",
    type: "website",
    url: "https://playmini.fun/bubble-shooter",
  },
};

export default function BubbleShooterPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">Aim, shoot, match 3+ of the same color</p>
      </div>
        <BubbleShooterPlay />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Bubble Shooter Game",
            description:
              "Free online Bubble Shooter puzzle. Match 3+ bubbles of the same color to pop them and clear the board.",
            url: "https://playmini.fun/bubble-shooter",
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
