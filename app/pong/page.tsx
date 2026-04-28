import type { Metadata } from "next";
import Pong from "../components/Pong";
import MoreGames from "../components/MoreGames";

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
            Pong
          </h1>
          <p className="text-ink-2 text-lg">
            Classic paddle vs AI. Move your paddle, return the ball, and be the first to score 7 points!
          </p>
        </div>

        <Pong />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-teal-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Move your mouse up and down to control the paddle</li>
                <li>Arrow keys Up/Down also work</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Touch and drag on the left side of the table to move your paddle</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>First player to 7 points wins the match</li>
                <li>Hit the ball with different parts of your paddle to add spin</li>
                <li>The ball speeds up slightly with each rally</li>
                <li>The AI gets smarter as you score more points</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-teal-400">About Pong</h2>
          <div className="text-ink-2 space-y-3">
            <p>
              Pong is the classic arcade paddle game — one of the original video games. This digital version captures the essence of the original with modern visuals.
            </p>
            <p>
              Face off against an AI opponent that adapts to your skill level. The AI tracks the ball more accurately as the match progresses, so you need quick reflexes and smart paddle positioning to win. How many matches can you win in a row?
            </p>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How do I control my paddle?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "On desktop, move your mouse up and down or use the arrow keys. On mobile, touch and drag on the left side of the screen to move your paddle.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does the AI difficulty increase?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The AI opponent gets faster and more accurate as you score more points, making the game progressively more challenging.",
                  },
                },
              ],
            }),
          }}
        />

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

        <MoreGames />
      </div>
    </main>
  );
}
