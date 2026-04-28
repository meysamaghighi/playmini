import type { Metadata } from "next";
import BreakoutGame from "../components/BreakoutGame";
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-purple-600 bg-clip-text text-transparent">
            Breakout
          </h1>
          <p className="text-ink-2 text-lg">
            Bounce the ball, clear the bricks, don&apos;t let it fall.
          </p>
        </div>

        <BreakoutGame />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Left/Right arrows or A/D to move the paddle</li>
                <li>Or just move the mouse over the canvas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Slide your finger along the canvas to move the paddle</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Gameplay:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Bounce the ball off your paddle to destroy the coloured bricks</li>
                <li>Each cleared board sends you to the next level — the ball gets a little faster</li>
                <li>You start with 3 lives; lose them all and the game ends</li>
                <li>Hit the ball with the edge of the paddle for a sharper angle</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">About Breakout</h2>
          <div className="text-ink-2 space-y-3">
            <p>
              Breakout is a timeless arcade classic. Move the paddle, bounce the ball into the
              brick wall, and clear every brick on the screen. Miss the ball and you lose a life.
            </p>
            <p>
              This version keeps it simple: pure paddle-and-ball, level-up on full clear, faster
              each level, best score saved in your browser.
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
                  name: "How do I control the paddle in Breakout?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "On desktop, use left/right arrows or A/D to move the paddle, or just move the mouse over the canvas. On mobile, slide your finger along the canvas to move the paddle.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I angle the ball?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Where the ball hits the paddle determines its angle. Hitting with the centre of the paddle sends the ball nearly straight up; hitting with the edge sends it sharply sideways.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does level progression work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Clearing every brick advances you to the next level with a fresh wall and a slightly faster ball. The level number is shown at the top.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my score saved?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Your best score is saved in your browser's local storage and shown on every game-over screen.",
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
