import type { Metadata } from "next";
import SpaceInvaders from "../components/SpaceInvaders";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Space Invaders Online Free - Browser Game | PlayMini",
  description:
    "Play Space Invaders online free! Classic arcade shooter in your browser. Defend Earth from alien invaders. No download needed. Desktop and mobile friendly.",
  keywords: [
    "play space invaders online free",
    "space invaders browser game",
    "space invaders online",
    "free space invaders",
    "space invaders game",
    "arcade shooter",
    "retro game online",
    "classic arcade game",
  ],
  openGraph: {
    title: "Play Space Invaders Online Free - Browser Game | PlayMini",
    description:
      "Play Space Invaders online free! Classic arcade shooter in your browser. Defend Earth from alien invaders.",
    type: "website",
    url: "https://playmini.fun/space-invaders",
  },
};

export default function SpaceInvadersPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Space Invaders</h1>
        <p className="text-gray-400">Defend Earth from alien invaders</p>
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
              <li>Space - Shoot</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Destroy all alien invaders before they reach the bottom</li>
              <li>Avoid alien bullets</li>
              <li>You have 3 lives</li>
              <li>Aliens speed up as you destroy more of them</li>
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
            In this version, face waves of alien invaders marching down the screen. Move your ship left and right to dodge their bullets while shooting back. The aliens march faster as you eliminate more of them, increasing the challenge.
          </p>
          <p>
            Can you defend Earth and achieve a high score?
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
                  text: "Use the arrow keys or A/D to move your ship left and right. Press the space bar to shoot at the aliens. Destroy all aliens before they reach the bottom while avoiding their bullets.",
                },
              },
              {
                "@type": "Question",
                name: "What happens when I lose all my lives?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The game ends when you lose all 3 lives. You can start a new game to try again and beat your high score.",
                },
              },
              {
                "@type": "Question",
                name: "Do the aliens get faster?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! The aliens progressively speed up as you destroy more of them, making the game increasingly challenging.",
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
