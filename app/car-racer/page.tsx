import type { Metadata } from "next";
import CarRacer from "../components/CarRacer";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Car Racing Game Online Free - Browser Car Game | PlayMini",
  description:
    "Play car racing game online free! Dodge traffic, collect coins, and race for high scores. Top-down browser car game with smooth controls. No download needed.",
  keywords: [
    "car racing game online free",
    "browser car game",
    "car racer online",
    "free racing game",
    "online car game",
    "top-down racing",
    "arcade racing game",
    "endless runner car",
  ],
  alternates: {
    canonical: "/car-racer",
  },
  openGraph: {
    title: "Car Racing Game Online Free - Browser Car Game | PlayMini",
    description:
      "Play car racing game online free! Dodge traffic, collect coins, and race for high scores in this browser car game.",
    type: "website",
    url: "https://playmini.fun/car-racer",
  },
};

export default function CarRacerPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
            Car Racer
          </h1>
          <p className="text-gray-300 text-lg">
            Dodge traffic, collect coins, and survive as long as you can on the endless highway!
          </p>
        </div>

        {/* Game */}
        <CarRacer />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use Left/Right Arrow Keys to change lanes</li>
                <li>Alternative: A and D keys</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Swipe left or right to change lanes</li>
                <li>Or tap the left/right side of the screen to steer</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Stay in one of three lanes and avoid hitting other cars</li>
                <li>Collect yellow coins for +10 bonus points</li>
                <li>Your score increases based on distance traveled</li>
                <li>The game speeds up gradually - stay focused!</li>
                <li>Try to beat your personal best score!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Car Racer */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">About Car Racer</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Car Racer is a fast-paced endless driving game where quick reflexes and sharp focus are key. Navigate through increasingly dense traffic while collecting bonus coins to maximize your score.
            </p>
            <p>
              The game features a classic top-down perspective reminiscent of arcade racing games from the 1980s and 1990s. As you progress, the speed gradually increases, making it harder to dodge obstacles and requiring split-second decisions.
            </p>
            <p>
              Challenge yourself to beat your high score and master the art of lane switching at high speeds. Perfect for quick gaming sessions or extended play to climb the leaderboard!
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
                  name: "How do I control the car in Car Racer?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "On desktop, use the left and right arrow keys (or A and D keys) to change lanes. On mobile, swipe left or right, or tap the left/right side of the screen to steer your car.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does scoring work in Car Racer?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Your score increases automatically based on the distance you travel. You can earn bonus points by collecting yellow coins (+10 points each). The longer you survive, the higher your score!",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does the game get harder as I play?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The game gradually increases in speed as you travel further, making it progressively more challenging to avoid obstacles. Traffic density also varies to keep you on your toes.",
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
              name: "Car Racer",
              description:
                "Play Car Racer free online - a thrilling top-down endless driving game with smooth controls and high score tracking.",
              url: "https://playmini.fun/car-racer",
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
