import type { Metadata } from "next";
import SpaceInvaders from "../components/SpaceInvaders";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Space Invaders Online Free - 10 Levels & Power-Ups | PlayMini",
  description:
    "Play Space Invaders online free! 10 levels + endless mode, 3 enemy types, power-ups (shield, rapid fire, spread shot). Classic arcade shooter in your browser. No download needed.",
  keywords: [
    "play space invaders online free",
    "space invaders browser game",
    "space invaders online",
    "free space invaders",
    "space invaders game",
    "arcade shooter",
    "space invaders levels",
    "retro game online",
  ],
  openGraph: {
    title: "Play Space Invaders Online Free - 10 Levels & Power-Ups | PlayMini",
    description:
      "Play Space Invaders online free! 10 levels, 3 enemy types, power-ups. Classic arcade shooter in your browser.",
    type: "website",
    url: "https://playmini.fun/space-invaders",
  },
};

export default function SpaceInvadersPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Space Invaders</h1>
        <p className="text-gray-400">10 levels, 3 enemy types, power-ups -- defend Earth!</p>
      </div>

      <SpaceInvaders />

      {/* How to Play section */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-red-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Arrow Keys or A/D - Move left and right</li>
              <li>Auto-shooting enabled (no need to press fire)</li>
              <li>Touch buttons on mobile</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Clear all aliens to advance to the next level (10 levels + endless)</li>
              <li>Avoid alien bullets -- you have 3 lives (+1 bonus every 5 levels)</li>
              <li>Collect power-ups: Shield, Rapid Fire, Spread Shot</li>
              <li>3 enemy types: Normal (red), Tough (blue, 2 hits), Elite (gold, 3 hits)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Space Invaders */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-red-400">About Space Invaders</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Space Invaders is a classic arcade game that defined the shooter genre. Originally released in 1978, it became one of the most influential video games of all time.
          </p>
          <p>
            This version features 10 progressively harder levels plus an endless mode. Face three enemy types: normal (red), tough (blue, takes 2 hits), and elite (gold, takes 3 hits). Collect power-ups dropped by defeated aliens: Shield absorbs a hit, Rapid Fire doubles your shooting speed, and Spread Shot fires three bullets at once.
          </p>
          <p>
            Can you reach level 10 and survive the endless waves beyond?
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
                name: "How do I play Space Invaders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Use the arrow keys or A/D to move your ship left and right. Your ship auto-shoots. Destroy all aliens to advance to the next level. Collect power-ups (shield, rapid fire, spread shot) to gain an advantage.",
                },
              },
              {
                "@type": "Question",
                name: "What happens when I lose all my lives?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The game ends when you lose all lives. You start with 3 lives and earn a bonus life every 5 levels (max 5). Your high score is saved automatically.",
                },
              },
              {
                "@type": "Question",
                name: "How many levels are there?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are 10 handcrafted levels with increasing difficulty, plus an endless mode that scales infinitely. Each level has more aliens, faster movement, and tougher enemy types (blue takes 2 hits, gold takes 3 hits).",
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
            name: "Space Invaders Game",
            description:
              "Free online Space Invaders arcade game. Defend Earth from alien invaders!",
            url: "https://playmini.fun/space-invaders",
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
    </main>
  );
}
