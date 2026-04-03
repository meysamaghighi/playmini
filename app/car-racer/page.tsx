import type { Metadata } from "next";
import CarRacer from "../components/CarRacer";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Car Racing Game Online Free - 10 Levels + Power-ups | PlayMini",
  description:
    "Play car racing game online free! Conquer 10 challenging levels, dodge traffic, collect power-ups, and race for high scores. Top-down browser car game with varied obstacles. No download needed.",
  keywords: [
    "car racing game online free",
    "browser car game",
    "car racer online",
    "free racing game",
    "online car game",
    "top-down racing",
    "arcade racing game",
    "level-based racing",
    "power-up racing game",
  ],
  alternates: {
    canonical: "/car-racer",
  },
  openGraph: {
    title: "Car Racing Game Online Free - 10 Levels + Power-ups | PlayMini",
    description:
      "Play car racing game online free! Conquer 10 challenging levels with power-ups, obstacles, and intense traffic in this browser car game.",
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
            Conquer 10 challenging levels! Dodge traffic, collect power-ups, avoid obstacles, and race to victory!
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
                <li>Left/Right Arrow Keys (or A/D) to change lanes</li>
                <li>Up/Down Arrow Keys (or W/S) to boost/brake</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Swipe left/right to change lanes</li>
                <li>Swipe up/down to boost/brake</li>
                <li>Or tap the left/right side of the screen to steer</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Game Mechanics:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Start with 3 lives (hearts) - gain bonus lives every 5 levels</li>
                <li>Complete 10 handcrafted levels, then unlock endless mode</li>
                <li>Each level has unique traffic patterns and difficulty</li>
                <li>Avoid cars, trucks, and motorcycles (varied sizes and speeds)</li>
                <li>Watch for oil slicks (slow you down) and roadwork barriers</li>
                <li>Hit ramps to jump over obstacles</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Collectibles:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Yellow coins: +10 points each</li>
                <li>🛡️ Shield: Absorbs one collision (5 seconds)</li>
                <li>⚡ Speed Boost: 50% faster for 5 seconds</li>
                <li>🧲 Magnet: Auto-collect nearby coins (5 seconds)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Car Racer */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">About Car Racer</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Car Racer is a fast-paced level-based driving game where quick reflexes and sharp focus are key. Navigate through 10 handcrafted levels with increasing difficulty, from Easy Highway to the chaotic Final Mile. Beat all 10 levels to unlock endless mode!
            </p>
            <p>
              The game features a classic top-down perspective with modern twists: varied obstacle types (cars, trucks, motorcycles), environmental hazards (oil slicks, roadwork), strategic power-ups (shield, speed boost, magnet), and dramatic jump ramps. Each level introduces new challenges and faster speeds.
            </p>
            <p>
              With 6 vehicles to choose from (each with unique speed stats), a lives system that rewards skillful play, and power-ups that create tactical decisions, Car Racer offers deep replayability. Challenge yourself to beat all levels and achieve the highest score!
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
                    text: "On desktop, use arrow keys or WASD: left/right (or A/D) to change lanes, up/down (or W/S) to boost/brake. On mobile, swipe left/right to steer, swipe up/down to control speed, or tap the sides of the screen.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How many levels are in Car Racer?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Car Racer features 10 handcrafted levels with increasing difficulty, from Highway Easy to the Final Mile. After completing level 10, you unlock endless mode for unlimited play with scaling difficulty.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What power-ups are available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Three power-ups appear randomly: Shield (blocks one collision), Speed Boost (50% faster for 5 seconds), and Magnet (auto-collects nearby coins for 5 seconds). Each power-up grants +20 bonus points.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does the lives system work?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You start with 3 lives. Collisions cost one life, and the game ends when you run out. Earn bonus lives every 5 levels (capped at 5 total). After losing a life, you respawn with a temporary shield.",
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
                "Play Car Racer free online - a thrilling top-down driving game with 10 levels, power-ups, obstacles, and varied traffic. Smooth controls and high score tracking.",
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
