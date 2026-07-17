import type { Metadata } from "next";
import MinesweeperPlay from "./MinesweeperPlay";

export const metadata: Metadata = {
  title: "Minesweeper Game Online Free - Classic Logic Puzzle | PlayMini",
  description:
    "Play Minesweeper game online free in your browser! Classic logic puzzle with 3 difficulty levels (Easy, Medium, Hard). Clear all mines to win. No download needed, mobile-friendly.",
  keywords: [
    "minesweeper game online",
    "play minesweeper online free",
    "minesweeper online",
    "minesweeper game",
    "free minesweeper",
    "classic minesweeper",
    "minesweeper game online free",
    "minesweeper unblocked",
    "minesweeper browser game",
  ],
  alternates: {
    canonical: "/minesweeper",
  },
  openGraph: {
    title: "Minesweeper Game Online Free - Classic Logic Puzzle | PlayMini",
    description:
      "Play Minesweeper game online free in your browser! Classic logic puzzle with 3 difficulty levels. Clear all mines to win. No download needed, mobile-friendly.",
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
    title: "Minesweeper Game Online Free - Classic Logic Puzzle",
    description:
      "Play Minesweeper game online free! Classic logic puzzle with 3 difficulty levels. No download, browser-based.",
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
      {
        "@type": "Question",
        name: "Can I play Minesweeper on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! This Minesweeper game works perfectly on mobile devices. Tap to reveal cells and long-press to place flags. The game is fully responsive and optimized for touchscreens, making it easy to play on phones and tablets.",
        },
      },
      {
        "@type": "Question",
        name: "Is the first click in Minesweeper always safe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! The first click is always safe. The mines are generated after your first click to ensure you don't hit a mine on your opening move. This gives you a fair start and allows you to begin building your strategy.",
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
        <MinesweeperPlay />

      {/* How to Play Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 text-ink">
            How to Play Minesweeper
          </h2>
          <div className="bg-paper-2 rounded-lg p-6 border border-line text-ink-2 space-y-4">
            <p>
              <strong className="text-ink">Objective:</strong> Reveal all cells that don't contain mines. If you click on a mine, you lose!
            </p>
            <p>
              <strong className="text-ink">Left Click / Tap:</strong> Reveal a cell. The first click is always safe - mines are generated after your first move.
            </p>
            <p>
              <strong className="text-ink">Right Click / Long Press:</strong> Place a flag to mark cells you think contain mines. This helps you keep track of dangerous spots.
            </p>
            <p>
              <strong className="text-ink">Numbers:</strong> When you reveal a cell, you'll either see a number or an empty space. The number indicates how many mines are in the 8 surrounding cells. Empty cells have no adjacent mines and will automatically reveal their neighbors.
            </p>
            <p>
              <strong className="text-ink">Strategy:</strong> Use logic to deduce mine locations. If a cell shows "1" and you've already flagged one adjacent cell, all other adjacent cells are safe. Start with corners and edges where you have fewer cells to consider.
            </p>
            <p>
              <strong className="text-ink">Winning:</strong> You win when all non-mine cells are revealed. Your completion time is tracked, and your personal best is saved for each difficulty level!
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
