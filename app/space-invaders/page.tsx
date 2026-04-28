import type { Metadata } from "next";
import SpaceInvadersPlay from "./SpaceInvadersPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Space Invaders Online Free - 10 Levels & Power-Ups | PlayMini",
  description:
    "Play Space Invaders online free! 10 levels + endless mode, 3 enemy types, power-ups (shield, rapid fire, spread shot). Classic arcade shooter in your browser. No download needed.",
  keywords: [
    "play space invaders online free",
    "space invaders online",
    "space invaders free",
    "classic space invaders game",
    "space invaders browser game",
    "retro arcade games online",
    "space invaders no download",
    "arcade shooter game",
    "space invaders levels",
    "alien shooter game",
    "classic arcade game online",
    "space shooter game free",
  ],
  alternates: {
    canonical: "/space-invaders",
  },
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
        <p className="text-ink-2">10 levels, 3 enemy types, power-ups -- defend Earth!</p>
      </div>
        <SpaceInvadersPlay />

      {/* How to Play section */}
      <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
        <h2 className="text-2xl font-bold mb-4 text-red-400">How to Play</h2>
        <div className="space-y-4 text-ink-2">
          <div>
            <h3 className="font-semibold text-ink mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Arrow Keys or A/D - Move left and right</li>
              <li>Auto-shooting enabled (no need to press fire)</li>
              <li>Touch buttons on mobile</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink mb-2">Goal:</h3>
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
      <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
        <h2 className="text-2xl font-bold mb-4 text-red-400">About Space Invaders</h2>
        <div className="text-ink-2 space-y-3">
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
                name: "How do I play Space Invaders online?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Use arrow keys or A/D to move your spaceship left and right. Your ship automatically shoots at the alien invaders. Destroy all aliens to advance to the next level. Collect power-ups (shield, rapid fire, spread shot) dropped by defeated aliens to boost your firepower and survive longer.",
                },
              },
              {
                "@type": "Question",
                name: "Is Space Invaders free to play?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Space Invaders is completely free to play online with no download or registration required. Just open your browser and start defending Earth from alien invaders. Your high score is saved automatically in your browser.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play Space Invaders on mobile?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely! Space Invaders works great on mobile devices with touch controls. Use the on-screen touch buttons to move your ship left and right. The game is fully responsive and plays smoothly on phones and tablets.",
                },
              },
              {
                "@type": "Question",
                name: "What are the rules of Space Invaders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Move your ship horizontally at the bottom of the screen and shoot upward to destroy waves of alien invaders. Avoid enemy bullets and clear all aliens to advance. You have 3 lives (with bonus lives every 5 levels) and face three enemy types with increasing difficulty.",
                },
              },
              {
                "@type": "Question",
                name: "How many levels are in Space Invaders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Space Invaders features 10 handcrafted levels with progressively harder challenges, plus an endless mode after level 10 that scales infinitely. Each level introduces more aliens, faster movement speeds, and tougher enemy types (blue takes 2 hits, gold takes 3 hits).",
                },
              },
              {
                "@type": "Question",
                name: "What are the power-ups in Space Invaders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are three power-ups dropped randomly by defeated aliens: Shield (absorbs one hit), Rapid Fire (doubles your shooting speed), and Spread Shot (fires three bullets at once). These power-ups are essential for surviving the harder levels and endless mode.",
                },
              },
              {
                "@type": "Question",
                name: "Can you play Space Invaders without downloading?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Space Invaders runs directly in your web browser with zero downloads or installations required. It works on any device with a modern browser - desktop computers, laptops, smartphones, and tablets. Just load the page and start playing instantly.",
                },
              },
              {
                "@type": "Question",
                name: "What are the different enemy types in Space Invaders?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are three enemy types: Normal aliens (red, destroyed in one hit), Tough aliens (blue, require two hits), and Elite aliens (gold, require three hits). Higher levels introduce more tough and elite enemies, making the game progressively more challenging.",
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
