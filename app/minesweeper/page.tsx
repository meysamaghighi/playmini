import type { Metadata } from "next";
import MinesweeperGame from "../components/MinesweeperGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Minesweeper Online Free - Minesweeper Browser Game",
  description:
    "Play minesweeper online free! Classic logic puzzle with 3 difficulty levels. Clear the board without hitting mines. No download. Desktop and mobile friendly.",
  keywords: [
    "play minesweeper online free",
    "minesweeper browser game",
    "minesweeper online",
    "free minesweeper",
    "classic minesweeper",
    "minesweeper game online",
    "minesweeper unblocked",
  ],
  openGraph: {
    title: "Play Minesweeper Online Free - Minesweeper Browser Game",
    description:
      "Play minesweeper online free! Classic logic puzzle with 3 difficulty levels. Clear the board without hitting mines.",
    url: "https://playmini.fun/minesweeper",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PlayMini - Free Browser Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Minesweeper Online Free - Minesweeper Browser Game",
    description:
      "Play minesweeper online free! Classic logic puzzle with 3 difficulty levels.",
  },
};

export default function MinesweeperPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do you play Minesweeper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click cells to reveal them. Numbers show how many mines are adjacent. Use right-click or long press to flag suspected mines. Your goal is to reveal all safe cells without clicking on any mines. The first click is always safe!",
        },
      },
      {
        "@type": "Question",
        name: "What do the numbers mean in Minesweeper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each number tells you how many mines are in the 8 cells surrounding that number (horizontally, vertically, and diagonally). Use these clues to deduce where mines are located and where it's safe to click.",
        },
      },
      {
        "@type": "Question",
        name: "What are the difficulty levels in Minesweeper?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "There are three difficulty levels: Easy (9x9 grid with 10 mines), Medium (16x16 grid with 40 mines), and Hard (16x30 grid with 99 mines). Each difficulty tracks your personal best time separately.",
        },
      },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Minesweeper",
    description:
      "Play classic Minesweeper online for free with three difficulty levels and personal best tracking.",
    url: "https://playmini.fun/minesweeper",
    applicationCategory: "Game",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <MinesweeperGame />

      {/* How to Play Section */}
      <section className="bg-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            How to Play Minesweeper
          </h2>
          <div className="bg-slate-800 rounded-lg p-8 text-slate-300 space-y-4">
            <p>
              <strong className="text-white">Objective:</strong> Reveal all cells that don't contain mines. If you click on a mine, you lose!
            </p>
            <p>
              <strong className="text-white">Left Click / Tap:</strong> Reveal a cell. The first click is always safe - mines are generated after your first move.
            </p>
            <p>
              <strong className="text-white">Right Click / Long Press:</strong> Place a flag to mark cells you think contain mines. This helps you keep track of dangerous spots.
            </p>
            <p>
              <strong className="text-white">Numbers:</strong> When you reveal a cell, you'll either see a number or an empty space. The number indicates how many mines are in the 8 surrounding cells. Empty cells have no adjacent mines and will automatically reveal their neighbors.
            </p>
            <p>
              <strong className="text-white">Strategy:</strong> Use logic to deduce mine locations. If a cell shows "1" and you've already flagged one adjacent cell, all other adjacent cells are safe. Start with corners and edges where you have fewer cells to consider.
            </p>
            <p>
              <strong className="text-white">Winning:</strong> You win when all non-mine cells are revealed. Your completion time is tracked, and your personal best is saved for each difficulty level!
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            About Minesweeper
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Minesweeper is a classic logic puzzle game that has been a favorite since the 1990s. This online version brings the timeless gameplay to your browser with three difficulty levels, personal best tracking, and mobile support. Challenge yourself to improve your solving speed and master the art of logical deduction!
          </p>
          <p className="text-slate-300 text-lg leading-relaxed">
            Whether you're a beginner starting with Easy mode or a veteran tackling the challenging Hard difficulty, Minesweeper offers endless hours of engaging puzzle-solving. No downloads required - just click and play!
          </p>
        </div>
      </section>

      <MoreGames />
    </>
  );
}
