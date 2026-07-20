import type { Metadata } from "next";
import PongPlay from "./PongPlay";

export const metadata: Metadata = {
  title: "Play Pong Online Free - Classic Paddle Game | PlayMini",
  description:
    "Play Pong online free! Classic paddle game vs AI. Return the ball, first to 7 wins. Browser-based, works on mobile and desktop. No download.",
  keywords:
    "pong game, free pong, online pong, paddle game, classic arcade, browser game, ping pong",
  alternates: {
    canonical: "/pong",
  },
  openGraph: {
    title: "Play Pong Online Free - Classic Paddle Game | PlayMini",
    description:
      "Play Pong online free! Classic paddle game vs AI. Return the ball, first to 7 wins. Browser-based, works on mobile and desktop. No download.",
    type: "website",
    url: "https://playmini.fun/pong",
  },
};

export default function PongPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Classic paddle vs AI. Move your paddle, return the ball, and be the first to score 7 points!
          </p>
        </div>
        <PongPlay />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pong",
              description:
                "Free online Pong game. Play against AI in this classic paddle game.",
              url: "https://playmini.fun/pong",
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
