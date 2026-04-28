import type { Metadata } from "next";
import MemoryPlay from "./MemoryPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Memory Match Online Free - Card Game | PlayMini",
  description:
    "Play Memory Match online free! Flip cards to find matching pairs. Three difficulty levels, timer, fewest-moves best score saved. No download needed.",
  keywords:
    "memory match, memory game, card flip game, matching game, concentration game, brain game, memory test, online memory game, free memory game",
  alternates: {
    canonical: "/memory",
  },
  openGraph: {
    title: "Play Memory Match Online Free - Card Game | PlayMini",
    description:
      "Play Memory Match online free! Flip cards to find matching pairs. Three difficulty levels, timer, fewest-moves best score saved. No download needed.",
    type: "website",
    url: "https://playmini.fun/memory",
  },
};

export default function MemoryMatchPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Flip cards to find matching pairs. Test your memory and complete the puzzle in the fewest moves!
          </p>
        </div>

        {/* Game */}
        <MemoryPlay />

        {/* How to Play */}
        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Game Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All cards start face down at the beginning of the game</li>
                <li>Click or tap any card to flip it face up</li>
                <li>Click a second card to try to find a match</li>
                <li>If the two cards match, they stay face up with a golden glow</li>
                <li>If they don't match, both cards flip back face down</li>
                <li>Continue until all pairs are matched</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Difficulty Levels:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Easy:</strong> 6 pairs (4 cols) - perfect for beginners</li>
                <li><strong>Medium:</strong> 10 pairs (5 cols) - balanced challenge</li>
                <li><strong>Hard:</strong> 15 pairs (6 cols) - ultimate memory test</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Scoring:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your score is the number of moves (card flips) to clear the board</li>
                <li>Personal best is saved for each difficulty level</li>
                <li>Timer runs while you play — both moves and time are shown at the end</li>
                <li>Try to complete the game in the minimum possible moves!</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Memory Match */}
        <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">About Memory Match</h2>
          <div className="text-ink-2 space-y-3">
            <p>
              Memory Match, also known as Concentration or Pairs, is a classic card game that has been enjoyed for generations. The game challenges your short-term memory and concentration skills as you try to remember the location of matching cards.
            </p>
            <p>
              This digital version brings the classic gameplay to your browser with beautiful animations, multiple difficulty levels, and score tracking. Whether you're looking for a quick brain exercise or want to challenge yourself with the hardest difficulty, Memory Match offers engaging gameplay for all skill levels.
            </p>
            <p>
              Studies have shown that memory games like this can help improve cognitive function, concentration, and visual memory. Play regularly to keep your mind sharp and try to beat your personal best scores!
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
                  name: "How do I play Memory Match?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Click or tap on any card to flip it face up, then click another card to try to find its match. If the cards match, they stay face up. If not, they flip back after a moment. Continue until all pairs are matched. Try to complete the game in as few moves as possible!",
                  },
                },
                {
                  "@type": "Question",
                  name: "What are the different difficulty levels?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Memory Match offers three difficulty levels: Easy (6 pairs, 4 columns), Medium (10 pairs, 5 columns), and Hard (15 pairs, 6 columns). Each level challenges your memory differently, with more cards requiring better concentration and recall.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does Memory Match save my best scores?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Your personal best (fewest moves) is saved separately for each difficulty level in your browser's local storage. Try to beat your own records by completing games in fewer moves.",
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
              name: "Memory Match Game",
              description:
                "Free online memory card matching game with three difficulty levels. Test your memory and concentration skills.",
              url: "https://playmini.fun/memory",
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
