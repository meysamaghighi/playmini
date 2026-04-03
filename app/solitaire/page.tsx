import type { Metadata } from "next";
import Solitaire from "../components/Solitaire";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Solitaire Online Free - Klondike Card Game | PlayMini",
  description:
    "Play Solitaire online free! Classic Klondike card game, drag and drop to build foundations. Browser-based patience game, no download required. Mobile-friendly.",
  keywords:
    "solitaire, klondike, card game, patience, free solitaire, online card game, classic solitaire",
  alternates: {
    canonical: "/solitaire",
  },
  openGraph: {
    title: "Play Solitaire Online Free - Klondike Card Game | PlayMini",
    description:
      "Play Solitaire online free! Classic Klondike card game, drag and drop to build foundations. Browser-based patience game, no download required. Mobile-friendly.",
    type: "website",
    url: "https://playmini.fun/solitaire",
  },
};

export default function SolitairePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Solitaire</h1>
        <p className="text-gray-400">Classic Klondike patience card game</p>
      </div>

      <Solitaire />

      {/* How to Play section */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click a card to select it</li>
              <li>Click destination to move the selected card</li>
              <li>Click stock (top left) to draw cards</li>
              <li>When stock is empty, click to recycle waste pile</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Build four foundation piles (top right) by suit from Ace to King</li>
              <li>Arrange tableau piles in descending order, alternating colors</li>
              <li>Only Kings can be placed in empty tableau spaces</li>
              <li>Win by moving all cards to the foundations</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Rules:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Tableau: Build down in alternating colors (red on black, black on red)</li>
              <li>Foundations: Build up by suit (Ace, 2, 3... King)</li>
              <li>You can move sequences of cards between tableau piles</li>
              <li>Turn over face-down cards when they become the top of a pile</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Solitaire */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">About Solitaire</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Klondike Solitaire is the most popular version of the classic card game. Also known simply as "Solitaire," it became famous worldwide after being included in Windows in 1990.
          </p>
          <p>
            The game requires strategic thinking and careful planning. While some deals are impossible to win, most can be solved with the right moves. The key is to think ahead and avoid blocking cards you'll need later.
          </p>
          <p>
            Solitaire is perfect for quick breaks or longer gaming sessions. It's a relaxing yet engaging game that has entertained millions of players for generations.
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
                name: "How do I move cards in Solitaire?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Click on a card to select it (it will highlight), then click on the destination pile to move it there. You can move single cards or sequences of cards between tableau piles.",
                },
              },
              {
                "@type": "Question",
                name: "What cards can I place on the foundations?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Foundations must be built up by suit starting with an Ace. After placing an Ace, you can place a 2 of the same suit, then a 3, and so on up to King.",
                },
              },
              {
                "@type": "Question",
                name: "Can I move sequences of cards?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! In the tableau, you can move sequences of cards as long as they're in descending order and alternating colors. This is useful for uncovering face-down cards.",
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
            name: "Solitaire Game",
            description:
              "Free online Klondike Solitaire card game. Build foundations by suit in this classic patience game.",
            url: "https://playmini.fun/solitaire",
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
