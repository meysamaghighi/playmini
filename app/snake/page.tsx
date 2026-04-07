import type { Metadata } from "next";
import SnakeGame from "../components/SnakeGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Snake Game Online Free - Snake Game Browser | PlayMini",
  description:
    "Play snake game online free! Classic snake game in your browser. Eat food, grow longer, beat your high score. No download. Desktop and mobile friendly.",
  keywords: [
    "play snake game online free",
    "snake game browser",
    "snake game online",
    "classic snake game",
    "browser snake game",
    "snake game no download",
    "free snake game",
    "snake game unblocked",
    "retro snake game",
    "nokia snake game",
    "arcade snake online",
    "mobile snake game",
  ],
  alternates: {
    canonical: "/snake",
  },
  openGraph: {
    title: "Play Snake Game Online Free - Snake Game Browser | PlayMini",
    description:
      "Play snake game online free! Classic snake game in your browser. Eat food, grow longer, beat your high score.",
    type: "website",
    url: "https://playmini.fun/snake",
  },
};

export default function SnakePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Snake Game
          </h1>
          <p className="text-gray-300 text-lg">
            Control the snake, eat the red food, and grow as long as you can without hitting walls or yourself!
          </p>
        </div>

        {/* Game */}
        <SnakeGame />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use Arrow Keys to change direction</li>
                <li>Alternative: W, A, S, D keys</li>
                <li>Press Space to pause/resume</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Swipe in any direction to turn the snake</li>
                <li>Swipe anywhere on the game area to control</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Eat red food to grow longer and score points</li>
                <li>The snake moves faster as you grow</li>
                <li>Avoid hitting walls or your own tail</li>
                <li>Try to beat your personal best score!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Snake */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">About Snake</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Snake is one of the most iconic and addictive arcade games ever created. Originally popularized by Nokia mobile phones in the late 1990s, the game has become a timeless classic enjoyed by millions worldwide.
            </p>
            <p>
              The concept is simple yet challenging: guide a growing snake around the screen, eating food while avoiding collisions. As the snake gets longer, the difficulty increases, requiring quick reflexes and strategic planning.
            </p>
            <p>
              This version of Snake brings the classic gameplay to your browser with smooth controls, increasing difficulty, and score tracking. Challenge yourself to beat your high score!
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
                  name: "How do I play snake game online?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use arrow keys (or W/A/S/D) on desktop to control the snake's direction. On mobile, swipe in the direction you want to move. Guide the snake to eat red food squares to grow longer. Avoid hitting walls or your own tail, or the game ends.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is snake game free to play?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Snake game is completely free with no download required. Play instantly in your browser on any device - desktop, laptop, phone, or tablet. Your high score is automatically saved so you can keep track of your best games.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play snake game on my phone?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely! The snake game is fully optimized for mobile devices. Use simple swipe gestures to control the snake - swipe up, down, left, or right to change direction. It works smoothly on both phones and tablets with touch controls.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the rules of snake game?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The rules are simple: guide the snake to eat food (red squares) to grow longer and score points. The snake moves continuously in one direction until you change it. You lose if the snake hits a wall or runs into its own body. Try to get the highest score possible!",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does scoring work in snake game?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You earn 1 point for each piece of food your snake eats. As your snake grows longer, the challenge increases. Your personal best score is saved automatically in your browser, so you can always try to beat your high score.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does snake game get faster as I play?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Every time your snake eats food and grows longer, the game speed increases slightly. This progressive difficulty makes the game more challenging as you achieve higher scores, testing your reflexes and strategy.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play snake game without downloading?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! Snake game runs entirely in your web browser with no download or installation needed. Just visit the page and start playing instantly. It works on any modern browser on desktop, mobile, or tablet devices.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the best strategy for snake game?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Stay near the walls and move in controlled patterns to avoid trapping yourself. Plan your path ahead and avoid creating tight spaces your snake can't escape from. As you grow longer, use the edges of the board to safely navigate around your own body.",
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
              name: "Snake Game",
              description:
                "Play the classic Snake game free online with smooth controls and high score tracking.",
              url: "https://playmini.fun/snake",
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
