import { Metadata } from "next";
import Game2048Play from "./2048Play";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "2048 Game Online Free - Classic Puzzle Game | PlayMini",
  description:
    "Play 2048 game online free! Slide and merge numbered tiles to reach 2048. Addictive puzzle game, no download, works on mobile and desktop. Beat your high score!",
  keywords: [
    "play 2048 online free",
    "2048 game online",
    "2048 puzzle game",
    "2048 game free",
    "2048 browser game",
    "how to win 2048",
    "2048 strategy",
    "2048 online no download",
    "2048 unblocked",
    "merge puzzle game",
    "sliding tile puzzle",
    "number puzzle game",
  ],
  alternates: {
    canonical: "/2048",
  },
  openGraph: {
    title: "2048 Game Online Free - Classic Puzzle Game | PlayMini",
    description:
      "Play 2048 game online free! Slide and merge numbered tiles to reach 2048. Addictive puzzle game, no download, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/2048",
  },
};

export default function Page2048() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do you play 2048 online?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Use arrow keys on desktop or swipe on mobile to slide tiles across a 4x4 grid. When two tiles with the same number touch, they merge into one with double the value. The goal is to create a tile with the number 2048. After each move, a new tile (2 or 4) appears randomly on the board.",
                },
              },
              {
                "@type": "Question",
                name: "Is 2048 free to play?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! 2048 is completely free to play online with no download required. Just open your browser and start playing immediately. No registration, no ads interrupting gameplay, and your high score is saved automatically in your browser.",
                },
              },
              {
                "@type": "Question",
                name: "Can I play 2048 on my phone?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely! 2048 works perfectly on mobile devices. Use swipe gestures to move tiles in any direction - up, down, left, or right. The game is fully responsive and optimized for touchscreens on both phones and tablets.",
                },
              },
              {
                "@type": "Question",
                name: "What is the best strategy to win 2048?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Keep your highest-value tile in one corner (usually bottom-left or bottom-right) and build tiles in descending order around it. Avoid random moves and plan several moves ahead. Focus on merging smaller tiles first and try to keep one row or column filled to create more merging opportunities.",
                },
              },
              {
                "@type": "Question",
                name: "What happens when you reach 2048?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "When you successfully create a 2048 tile, you win the game! However, you can choose to continue playing to achieve a higher score and create even larger tiles like 4096, 8192, 16384, and beyond.",
                },
              },
              {
                "@type": "Question",
                name: "How do you get a high score in 2048?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "To maximize your score, focus on creating larger tiles through strategic merging. Keep your highest tile in a corner and avoid filling the board randomly. Each merge adds the tile value to your score, so creating bigger tiles (512, 1024, 2048) gives massive score boosts.",
                },
              },
              {
                "@type": "Question",
                name: "Can you play 2048 without downloading?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! 2048 runs entirely in your browser with no download or installation needed. It works on any device with a modern web browser - desktop, laptop, phone, or tablet. Just visit the page and start playing instantly.",
                },
              },
              {
                "@type": "Question",
                name: "What are the rules of 2048?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The rules are simple: slide tiles in four directions to merge matching numbers. When two tiles with the same number touch, they combine into one tile with their sum. A new tile (2 or 4) appears after each move. The game ends when the board is full and no moves are possible.",
                },
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "2048 Game",
            url: "https://playmini.fun/2048",
            applicationCategory: "Game",
            genre: "Puzzle",
            description:
              "Play the addictive 2048 puzzle game online for free. Combine numbered tiles to reach 2048.",
            browserRequirements: "Requires JavaScript. Works on mobile and desktop browsers.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      <div className="min-h-screen bg-paper text-ink py-8 px-4">
        <div className="max-w-4xl mx-auto">
        <Game2048Play />

          {/* How to Play */}
          <section className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <div className="bg-paper-2 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Controls</h3>
                <ul className="list-disc list-inside text-ink-2 space-y-1">
                  <li>
                    <strong>Desktop:</strong> Use arrow keys (↑ ↓ ← →) to move
                    tiles
                  </li>
                  <li>
                    <strong>Mobile:</strong> Swipe in any direction to move
                    tiles
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Rules</h3>
                <ul className="list-disc list-inside text-ink-2 space-y-1">
                  <li>
                    Tiles slide as far as possible in the chosen direction
                  </li>
                  <li>
                    When two tiles with the same number touch, they merge into
                    one
                  </li>
                  <li>The merged tile's value is the sum of the two tiles</li>
                  <li>
                    After each move, a new tile (2 or 4) appears on the board
                  </li>
                  <li>
                    The game ends when the board is full and no moves are
                    possible
                  </li>
                  <li>Win by creating a 2048 tile (but you can keep playing!)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Tips & Strategy</h3>
                <ul className="list-disc list-inside text-ink-2 space-y-1">
                  <li>
                    Keep your highest tile in a corner (bottom-left or
                    bottom-right works best)
                  </li>
                  <li>Build tiles in descending order from your highest tile</li>
                  <li>Don't make random moves - plan ahead</li>
                  <li>
                    Try to keep one row or column filled to create more merging
                    opportunities
                  </li>
                  <li>Focus on merging smaller tiles first</li>
                </ul>
              </div>
            </div>
          </section>

          {/* About 2048 */}
          <section className="mt-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">About 2048</h2>
            <div className="bg-paper-2 rounded-lg p-6 text-ink-2 space-y-3">
              <p>
                2048 is a sliding tile puzzle game where you combine numbered
                tiles to create larger numbers. The game was created by Italian
                web developer Gabriele Cirulli in 2014 and quickly became a
                viral sensation.
              </p>
              <p>
                The objective is simple: slide tiles on a 4×4 grid to combine
                them and create a tile with the number 2048. However, you can
                continue playing after reaching 2048 to achieve even higher
                scores with tiles like 4096, 8192, and beyond.
              </p>
              <p>
                This implementation features smooth gameplay, touch controls for
                mobile devices, automatic score tracking with personal best
                records, and a clean, modern design. Challenge yourself to beat
                your high score and share your achievements with friends!
              </p>
            </div>
          </section>

          <MoreGames />
        </div>
      </div>
    </>
  );
}
