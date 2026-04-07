import type { Metadata } from "next";
import DinoRunner from "../components/DinoRunner";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
  description:
    "Play Dino Run game online free! 10+ levels, power-ups, multiple biomes. Jump and duck like Chrome's T-Rex runner. Browser game, works on mobile and desktop.",
  keywords: [
    "chrome dino game online",
    "dino run game online",
    "play dino game online",
    "t-rex runner game",
    "chrome dinosaur game",
    "dinosaur game no internet",
    "dino game free",
    "endless runner game",
    "chrome dino runner",
    "offline dino game",
    "dino game levels",
    "dinosaur jump game",
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
                  name: "How do I play dino game online?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Press Space or Up Arrow to make the dinosaur jump over obstacles like cacti and rocks. Press Down Arrow to duck under flying pterodactyls. On mobile, tap to jump and swipe down to duck. Collect floating power-ups and progress through 10+ levels with different biomes and increasing difficulty.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is the chrome dino game free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes! The dino runner game is completely free to play online with no download required. Play instantly in your browser on desktop or mobile. This enhanced version includes 10+ levels, multiple biomes, power-ups, and a lives system - all free with no ads interrupting gameplay.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play dino game on my phone?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely! Dino Runner is fully optimized for mobile devices. Tap anywhere on the screen to jump over obstacles and swipe down to duck under flying pterodactyls. The game runs smoothly on both phones and tablets with responsive touch controls.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the power-ups in dino runner?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "There are four power-ups: Shield (absorbs one hit), Slow-Mo (slows the game for 3 seconds), 2x Points (doubles score gain for 5 seconds), and Tiny (shrinks your hitbox for 5 seconds, making dodging easier). Power-ups appear as floating icons during gameplay - just run into them to collect.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How many levels are in the dino game?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Dino Runner features 10 handcrafted levels across 5 unique biomes (Desert, Forest, Arctic, Volcano, City), plus an endless mode starting at Level 11+ with infinite scaling difficulty. Each level has distinct themes, obstacle patterns, and progressively faster speeds. You gain bonus lives every 5 levels.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the obstacles in chrome dino game?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Obstacles include ground cacti (jump over), rocks in various sizes (jump over), double cacti stacked close together (requires precise timing), and flying pterodactyls (duck under). Higher levels introduce more obstacle variety, tighter spacing, and faster speeds, testing your reflexes.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can you play dino game without internet?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "This version of Dino Runner requires an internet connection to load initially, but once loaded, it plays smoothly with minimal data usage. For the original Chrome offline dino game, disconnect your internet and visit any website in Chrome to access it.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is the difference between this and chrome dino?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "While inspired by Chrome's T-Rex runner, this version greatly expands the gameplay with 10+ handcrafted levels, multiple biomes (Desert, Forest, Arctic, Volcano, City), four different power-ups, a lives system with bonus lives, and three playable characters. It offers much more variety and replayability than the original endless runner.",
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
