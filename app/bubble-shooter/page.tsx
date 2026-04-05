import type { Metadata } from "next";
import BubbleShooter from "../components/BubbleShooter";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Bubble Shooter Online Free - Match 3 Game with Power-ups | PlayMini",
  description:
    "Play Bubble Shooter online free! 10 levels + endless mode with power-ups. Match 3+ bubbles, use fireballs and rainbow bombs. Browser-based, works on mobile and desktop.",
  keywords: [
    "bubble shooter game free online",
    "bubble pop game",
    "bubble shooter online",
    "free bubble shooter",
    "bubble game online",
    "match 3 bubbles",
    "puzzle game online",
    "bubble shooter unblocked",
    "bubble shooter levels",
    "bubble shooter power-ups",
  ],
  alternates: {
    canonical: "/bubble-shooter",
  },
  openGraph: {
    title: "Play Bubble Shooter Online Free - Match 3 Game with Power-ups | PlayMini",
    description:
      "Play Bubble Shooter online free! 10 levels + endless mode with power-ups. Match 3+ bubbles, use fireballs and rainbow bombs.",
    type: "website",
    url: "https://playmini.fun/bubble-shooter",
  },
};

export default function BubbleShooterPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Bubble Shooter</h1>
        <p className="text-gray-400">Match 3+ bubbles • 10 levels + power-ups</p>
      </div>

      <BubbleShooter />

      {/* How to Play section */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Desktop: Move mouse to aim, click to shoot</li>
              <li>Mobile: Touch and drag to aim, release to shoot</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Match 3 or more bubbles of the same color to pop them</li>
              <li>Clear all bubbles to advance through 10 levels + endless mode</li>
              <li>Bubbles that lose connection to the top will also fall</li>
              <li>Don't let bubbles reach the bottom - you have 3 lives!</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Special Features:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Fireball 🔥: Pops through multiple bubbles in a large radius</li>
              <li>Rainbow Bomb 🌈: Pops all bubbles of one color</li>
              <li>Precision Aim 🎯: Shows extended aim line for perfect shots</li>
              <li>Stone bubbles: Need 2 hits to break</li>
              <li>Bomb bubbles: Explode and clear neighbors</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Aim for cluster matches to clear more bubbles at once</li>
              <li>Use wall bounces to reach difficult spots</li>
              <li>Collect power-ups for special shots</li>
              <li>Watch out for the ceiling - it drops as you play!</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Bubble Shooter */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">About Bubble Shooter</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Bubble Shooter is a classic puzzle game that's easy to learn but challenging to master. This enhanced version features 10 progressive levels plus endless mode, with power-ups and special bubble types that add exciting new strategies.
          </p>
          <p>
            Each level increases in difficulty with more colors, faster ceiling drops, stone bubbles that need multiple hits, and explosive bomb bubbles. Collect power-ups to unleash fireballs, rainbow bombs, and precision aiming to help you clear the toughest challenges.
          </p>
          <p>
            With 3 lives and a lives system, you can recover from mistakes and keep pushing to beat your high score. Perfect for quick sessions or extended play!
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
                name: "How do I aim in Bubble Shooter?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "On desktop, move your mouse to aim and click to shoot. On mobile, touch and drag to aim, then release to shoot. A dotted line shows where your bubble will go.",
                },
              },
              {
                "@type": "Question",
                name: "What happens when I match 3 bubbles?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "When you create a group of 3 or more bubbles of the same color, they will pop and disappear. Any bubbles that lose connection to the top will also fall, giving you bonus points.",
                },
              },
              {
                "@type": "Question",
                name: "How do I advance to the next level?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Clear all bubbles from the board to complete the level. You'll receive bonus points and move on to a more challenging level with more bubbles, colors, and special bubble types. Progress through 10 levels to reach endless mode!",
                },
              },
              {
                "@type": "Question",
                name: "What are the power-ups in Bubble Shooter?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "There are 3 power-ups: Fireball (pops through multiple bubbles), Rainbow Bomb (pops all bubbles of one color), and Precision Aim (shows extended aim line). Collect them during gameplay for special shots!",
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
            name: "Bubble Shooter Game",
            description:
              "Free online Bubble Shooter puzzle game. Match 3+ bubbles to pop them, clear 10 levels with power-ups and special bubbles.",
            url: "https://playmini.fun/bubble-shooter",
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
