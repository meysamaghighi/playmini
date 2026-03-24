import type { Metadata } from "next";
import BubbleShooter from "../components/BubbleShooter";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Bubble Shooter - Match 3 Puzzle Game | PlayMini",
  description:
    "Free online Bubble Shooter game. Aim and shoot colored bubbles to match 3 or more. Clear the board to advance levels. Addictive puzzle action!",
  keywords:
    "bubble shooter, bubble game, match 3, puzzle game, free online game, bubble pop, matching game",
  openGraph: {
    title: "Bubble Shooter - Match 3 Puzzle Game | PlayMini",
    description:
      "Play free Bubble Shooter online. Match 3+ bubbles to pop them and clear the board!",
    type: "website",
    url: "https://playmini.fun/bubble-shooter",
  },
};

export default function BubbleShooterPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Bubble Shooter</h1>
        <p className="text-gray-400">Match 3+ bubbles to pop them</p>
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
              <li>Clear all bubbles to advance to the next level</li>
              <li>Bubbles that lose connection to the top will also fall</li>
              <li>Don't let bubbles reach the bottom!</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Aim for cluster matches to clear more bubbles at once</li>
              <li>Use wall bounces to reach difficult spots</li>
              <li>Check the "Next" bubble to plan your strategy</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Bubble Shooter */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">About Bubble Shooter</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Bubble Shooter is a classic puzzle game that's easy to learn but challenging to master. The game combines precision aiming with strategic thinking.
          </p>
          <p>
            Each level starts with rows of colored bubbles. Your goal is to clear them all by shooting bubbles from the bottom and creating matches of 3 or more. The levels get progressively harder with more rows and complex patterns.
          </p>
          <p>
            This addictive game has been a favorite for decades, offering relaxing yet engaging gameplay for players of all ages.
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
                  text: "Clear all bubbles from the board to complete the level. You'll receive bonus points and move on to a more challenging level with more bubbles.",
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
              "Free online Bubble Shooter puzzle game. Match 3+ bubbles to pop them and clear levels.",
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
