import type { Metadata } from "next";
import BreakoutGame from "../components/BreakoutGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Breakout Online Free - 10 Levels, Power-Ups & Brick Types | PlayMini",
  description:
    "Play Breakout online free! 10 levels + endless mode, 4 power-ups (multi-ball, laser, wide paddle, slow), 5 brick types, combo system. Classic brick breaker with modern features. Browser game with touch controls.",
  keywords:
    "breakout game, brick breaker, arkanoid, classic arcade game, breakout online, free breakout game, brick breaker online, paddle game, browser arcade game, breakout power ups, breakout levels",
  alternates: {
    canonical: "/breakout",
  },
  openGraph: {
    title: "Play Breakout Online Free - 10 Levels, Power-Ups & Brick Types | PlayMini",
    description:
      "Play Breakout online free! 10 levels, 4 power-ups, 5 brick types, combo system. Classic brick breaker arcade game with modern features.",
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
            10 levels, 4 power-ups, 5 brick types -- the ultimate brick breaker experience!
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
                <li>Use Left/Right Arrow Keys or A/D to move the paddle</li>
                <li>Press Space to launch the ball or shoot lasers (with laser power-up)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Drag your finger to move the paddle</li>
                <li>Tap anywhere to launch the ball or shoot lasers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Brick Types:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Normal</strong> - Standard colorful bricks (1 hit, 20-70 points by row)</li>
                <li><strong>Tough</strong> (blue) - Takes 2 hits to destroy (60 points)</li>
                <li><strong>Steel</strong> (gray) - Takes 3 hits to destroy (80 points)</li>
                <li><strong>Explosive</strong> (red with !) - Destroys neighboring bricks (100 points)</li>
                <li><strong>Gold</strong> (yellow with star) - Bonus points brick (200 points)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Power-Ups:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Multi-Ball</strong> (M, purple) - Splits each ball into 3</li>
                <li><strong>Wide Paddle</strong> (W, blue) - Temporarily widens your paddle</li>
                <li><strong>Laser</strong> (L, red) - Shoot lasers from paddle sides (Space to fire)</li>
                <li><strong>Slow Ball</strong> (S, cyan) - Temporarily slows down all balls</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Combo System:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Hit bricks consecutively without touching the paddle to build combo multiplier</li>
                <li>Up to 10x multiplier on brick points</li>
                <li>Combo resets when ball hits the paddle</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Levels:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>10 handcrafted levels with unique patterns and increasing difficulty</li>
                <li>Ball speed increases with each level</li>
                <li>After level 10, enter endless mode with continued scaling</li>
                <li>You start with 3 lives - don't let all balls fall off the bottom!</li>
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
              This modern version takes the classic formula to the next level with 10 progressively
              challenging levels, 5 different brick types (normal, tough, steel, explosive, and gold),
              and 4 power-ups (multi-ball, wide paddle, laser cannons, and slow ball). The combo system
              rewards skillful consecutive hits with up to 10x score multipliers.
            </p>
            <p>
              Master the art of paddle control to angle your shots, collect power-ups strategically,
              and build massive combos. Watch out for explosive bricks that destroy their neighbors
              and aim for the valuable gold bricks. Can you complete all 10 levels and dominate the
              endless mode?
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
                    text: "On desktop, use the left and right arrow keys (or A and D keys) to move the paddle horizontally. Press Space to launch the ball or shoot lasers (with laser power-up). On mobile, drag your finger across the screen to move the paddle and tap to launch the ball or shoot lasers.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the different brick types?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are 5 brick types: Normal (colorful, 1 hit, 20-70 points), Tough/blue (2 hits, 60 points), Steel/gray (3 hits, 80 points), Explosive/red (1 hit, destroys neighbors, 100 points), and Gold/yellow star (1 hit, 200 bonus points).",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does the combo system work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Hit bricks consecutively without the ball touching the paddle to build your combo multiplier, up to 10x. Each brick's points are multiplied by your current combo. The combo resets when the ball hits your paddle.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What power-ups are available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are 4 power-ups: Multi-Ball (M, purple) splits each ball into 3, Wide Paddle (W, blue) widens your paddle, Laser (L, red) adds laser cannons to shoot bricks, and Slow Ball (S, cyan) temporarily slows down all balls. Power-ups drop randomly from destroyed bricks.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How many levels are there?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are 10 handcrafted levels with unique brick patterns and progressively faster ball speeds. After completing level 10, you enter endless mode where the difficulty continues to scale infinitely.",
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
                "Play Breakout free online - the classic brick breaker arcade game with 10 levels, power-ups, 5 brick types, combo system, and high score tracking.",
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
