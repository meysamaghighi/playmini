import type { Metadata } from "next";
import BreakoutGame from "../components/BreakoutGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Breakout Online Free - Brick Breaker Game | PlayMini",
  description:
    "Play Breakout online free! Classic brick breaker arcade game. Smash colorful bricks, advance through levels, beat high scores. Browser game with touch controls.",
  keywords:
    "breakout game, brick breaker, arkanoid, classic arcade game, breakout online, free breakout game, brick breaker online, paddle game, browser arcade game",
  alternates: {
    canonical: "/breakout",
  },
  openGraph: {
    title: "Play Breakout Online Free - Brick Breaker Game | PlayMini",
    description:
      "Play Breakout online free! Classic brick breaker arcade game. Smash colorful bricks, advance through levels, beat high scores. Browser game with touch controls.",
    type: "website",
    url: "https://playmini.fun/breakout",
  },
};

export default function BreakoutPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-purple-600 bg-clip-text text-transparent">
            Breakout
          </h1>
          <p className="text-gray-300 text-lg">
            Break all the bricks with your ball and paddle to advance through levels!
          </p>
        </div>

        {/* Game */}
        <BreakoutGame />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use Left/Right Arrow Keys to move the paddle</li>
                <li>Alternative: A and D keys</li>
                <li>Press Space to launch the ball</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Drag your finger to move the paddle</li>
                <li>Tap anywhere to launch the ball</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Break all bricks to advance to the next level</li>
                <li>Different colored bricks award different points (red = 70, purple = 20)</li>
                <li>You start with 3 lives - don't let the ball fall off the bottom!</li>
                <li>The ball speeds up as you destroy more bricks</li>
                <li>Each new level increases the difficulty with faster ball speed</li>
                <li>Hit the ball with different parts of the paddle to control its angle</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Breakout */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">About Breakout</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Breakout is a timeless arcade classic that has captivated players since the 1970s.
              The game's simple yet addictive concept - using a paddle to bounce a ball and destroy
              bricks - has made it one of the most enduring video game genres.
            </p>
            <p>
              This modern browser-based version features colorful rainbow bricks arranged in six
              rows, each offering different point values. The red bricks at the top are worth the
              most points (70), while the purple bricks at the bottom award fewer points (20).
              Strategic play involves aiming for the high-value bricks while managing the
              increasing ball speed.
            </p>
            <p>
              As you progress through levels, the challenge intensifies with faster ball speeds.
              Master the art of paddle control to angle your shots and clear levels efficiently.
              Perfect for quick gaming sessions or extended play to reach the highest levels!
            </p>
          </div>
        </section>

        {/* FAQ Schema */}
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
                    text: "On desktop, use the left and right arrow keys (or A and D keys) to move the paddle horizontally. Press Space to launch the ball. On mobile, drag your finger across the screen to move the paddle and tap to launch the ball.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does scoring work in Breakout?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Different colored bricks award different points. Red bricks (top row) give 70 points, orange 60, yellow 50, green 40, blue 30, and purple (bottom row) 20 points. Break all bricks to advance to the next level with increased difficulty.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What happens when I lose all my lives?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You start with 3 lives. Each time the ball falls off the bottom of the screen, you lose a life. When all lives are lost, the game ends and your final score is recorded. If you beat your previous best score, it will be saved as your new personal best.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do levels work in Breakout?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "When you clear all bricks on the screen, you advance to the next level. Each new level features a fresh set of bricks and increased ball speed, making the game progressively more challenging. Your lives carry over between levels.",
                  },
                },
              ],
            }),
          }}
        />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Breakout",
              description:
                "Play Breakout free online - the classic brick breaker arcade game with colorful bricks, multiple levels, and high score tracking.",
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
