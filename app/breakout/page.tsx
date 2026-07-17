import type { Metadata } from "next";
import BreakoutPlay from "./BreakoutPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Breakout Online Free - Classic Brick Breaker | PlayMini",
  description:
    "Play Breakout online free! Move the paddle, bounce the ball, clear the bricks. Classic brick breaker arcade game in your browser, mobile-friendly, no download.",
  keywords:
    "breakout game, brick breaker, arkanoid, classic arcade game, breakout online, free breakout game, brick breaker online, paddle game, browser arcade game",
  alternates: {
    canonical: "/breakout",
  },
  openGraph: {
    title: "Play Breakout Online Free - Classic Brick Breaker | PlayMini",
    description:
      "Play Breakout online free! Move the paddle, bounce the ball, clear the bricks. Classic brick breaker arcade game.",
    type: "website",
    url: "https://playmini.fun/breakout",
  },
};

export default function BreakoutPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Bounce the ball, clear the bricks, don&apos;t let it fall.
          </p>
        </div>
        <BreakoutPlay />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Breakout",
              description:
                "Play Breakout free online — the classic brick breaker arcade game. Paddle + ball + bricks + level-up + saved high score.",
              url: "https://playmini.fun/breakout",
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
