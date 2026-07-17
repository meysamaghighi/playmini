import type { Metadata } from "next";
import SudokuPlay from "./SudokuPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Sudoku Online Free - 9x9 Puzzle Game | PlayMini",
  description:
    "Play Sudoku online free! Classic 9x9 number puzzle with Easy, Medium, and Hard difficulty. Timer, error tracking, best time per difficulty. Browser-based, no download required.",
  keywords:
    "sudoku, sudoku online, free sudoku, sudoku game, logic puzzle, number puzzle, brain game, 9x9 puzzle",
  alternates: {
    canonical: "/sudoku",
  },
  openGraph: {
    title: "Play Sudoku Online Free - 9x9 Puzzle Game | PlayMini",
    description:
      "Play Sudoku online free! Classic 9x9 number puzzle with Easy, Medium, and Hard difficulty. Timer, error tracking, best time per difficulty. Browser-based, no download required.",
    url: "https://playmini.fun/sudoku",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlayMini - Free Browser Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sudoku - Free Online | PlayMini",
    description:
      "Play free Sudoku online with 3 difficulty levels. Classic 9x9 logic puzzle with timer, error tracking, and best-time records.",
    images: ["https://playmini.fun/og-image.png"],
  },
};

export default function SudokuPage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sudoku",
    url: "https://playmini.fun/sudoku",
    description:
      "Free online Sudoku game with 3 difficulty levels, timer, and error tracking. Personal best times saved per difficulty.",
    applicationCategory: "Game",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires JavaScript",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="min-h-screen bg-slate-900 text-ink">
        <div className="max-w-6xl mx-auto px-4 py-8">
        <SudokuPlay />

          {/* More Games */}
          <section className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center">More Games</h2>
            <MoreGames />
          </section>
        </div>
      </div>
    </>
  );
}
