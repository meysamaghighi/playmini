import type { Metadata } from "next";
import DinoRunner from "../components/DinoRunner";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
  description:
    "Play Dino Run game online free! 10+ levels, power-ups, multiple biomes. Jump and duck like Chrome's T-Rex runner. Browser game, works on mobile and desktop.",
  keywords: [
    "dino run game online",
    "chrome dinosaur game online",
    "dino game online",
    "t-rex runner",
    "chrome dino game",
    "dinosaur game online free",
    "endless runner game",
    "dino runner",
    "dino game levels",
    "power up runner game",
  ],
  alternates: {
    canonical: "/dino-runner",
  },
  openGraph: {
    title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
    description:
      "Play Dino Run game online free! 10+ levels, power-ups, multiple biomes. Jump and duck like Chrome's T-Rex runner. Browser game, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/dino-runner",
  },
};

export default function DinoRunnerPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-lime-500 bg-clip-text text-transparent">
            Dino Runner
          </h1>
          <p className="text-gray-300 text-lg">
            Jump over obstacles, duck under pterodactyls, collect power-ups, and conquer 10+ levels across multiple biomes!
          </p>
        </div>

        {/* Game */}
        <DinoRunner />

        {/* How to Play */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Press Space or Up Arrow to jump over obstacles</li>
                <li>Press Down Arrow to duck under flying pterodactyls</li>
                <li>Tap Space or click the game to start</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tap anywhere on the game to jump</li>
                <li>Swipe down to duck under flying obstacles</li>
                <li>Release to stand back up after ducking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Gameplay:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Progress through 10 handcrafted levels with unique biomes (Desert, Forest, Arctic, Volcano, Night City)</li>
                <li>Level 11+ is endless mode with scaling difficulty</li>
                <li>Avoid obstacles: cacti, rocks, double cacti, and flying pterodactyls</li>
                <li>Collect floating power-ups: Shield (absorbs 1 hit), Slow-Mo (3s), 2x Points (5s), Tiny (smaller hitbox, 5s)</li>
                <li>Start with 3 lives, gain +1 bonus life every 5 levels (max 5 lives)</li>
                <li>Each level increases speed and obstacle variety</li>
                <li>Try to beat your personal best score!</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Power-Ups:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Shield (S): Absorbs one hit</li>
                <li>Slow-Mo (T): Slows the game for 3 seconds</li>
                <li>2x Points: Doubles score gain for 5 seconds</li>
                <li>Tiny (T): Shrinks your hitbox for 5 seconds, making dodging easier</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Dino Runner */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-green-400">About Dino Runner</h2>
          <div className="text-gray-300 space-y-3">
            <p>
              Dino Runner takes inspiration from the classic Chrome dinosaur game and expands it into a full adventure
              with 10+ handcrafted levels, multiple biomes, power-ups, and a lives system. Choose from three characters
              (Dino, Rooster, or Chicken) and guide them through diverse environments.
            </p>
            <p>
              Journey through Desert Dawn, Pine Forest, Arctic Tundra, Volcanic Wasteland, Night City, and more!
              Each level introduces new obstacle types and increasing difficulty. Face cacti, rocks, double obstacles,
              and flying pterodactyls. Collect power-ups to help you survive longer.
            </p>
            <p>
              The game features four power-ups: Shield (one-time hit protection), Slow-Mo (slow the game temporarily),
              2x Points (double your score), and Tiny (shrink your hitbox). Strategic use of power-ups is key to progressing
              through the harder levels.
            </p>
            <p>
              With a lives system, level progression, theme variety, smooth gameplay, and responsive controls for both
              desktop and mobile, Dino Runner offers deep replayability. Can you reach the endless mode (Level 11+) and
              set a high score?
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
                  name: "How do I play Dino Runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "On desktop, press Space or Up Arrow to jump over obstacles, and press Down Arrow to duck under pterodactyls. On mobile, tap to jump and swipe down to duck. Collect floating power-ups by running into them. Progress through 10+ levels with different biomes and increasing difficulty.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the power-ups in Dino Runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are four power-ups: Shield (S) absorbs one hit, Slow-Mo (T) slows the game for 3 seconds, 2x Points doubles your score for 5 seconds, and Tiny (T) shrinks your hitbox for 5 seconds making dodging easier. Power-ups appear randomly as you play.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How many levels are in Dino Runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Dino Runner has 10 handcrafted levels across 5 biomes (Desert, Forest, Arctic, Volcano, City), plus an endless Level 11+ with scaling difficulty. Each level has unique themes, obstacle types, and increasing speed. You gain a bonus life every 5 levels.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the obstacles in Dino Runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Obstacles include ground cacti (jump over), rocks (small and big, jump over), double cacti (two close together), and flying pterodactyls (duck under). Higher levels introduce more obstacle variety and tighter spacing, requiring quick reflexes.",
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
              name: "Dino Runner",
              description:
                "Play Dino Runner with 10+ levels, power-ups, multiple biomes, and lives system. Free endless runner game with level progression and replayability.",
              url: "https://playmini.fun/dino-runner",
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
