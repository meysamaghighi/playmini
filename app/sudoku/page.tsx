import type { Metadata } from "next";
import SudokuGame from "../components/SudokuGame";
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
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I play Sudoku?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Fill the 9x9 grid so that each row, column, and 3x3 box contains the digits 1-9 without repetition. Click a cell to select it, then type a number or use the number pad below the grid.",
        },
      },
      {
        "@type": "Question",
        name: "What are the difficulty levels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Easy provides 46 starting clues, Medium provides 36 clues, and Hard provides 26 clues. Fewer clues mean a more challenging puzzle that requires more solving techniques.",
        },
      },
      {
        "@type": "Question",
        name: "Are my best times saved?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Your fastest solve time is saved separately for each difficulty level in your browser's local storage. Beat your own records to see your best time update.",
        },
      },
    ],
  };

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">Sudoku</h1>
          <p className="text-slate-400 text-center mb-8 text-lg">
            Classic logic puzzle - Fill the grid with 1-9
          </p>

          <SudokuGame />

          {/* How to Play */}
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">How to Play</h2>
            <div className="bg-slate-800 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Objective</h3>
                <p className="text-slate-300">
                  Fill the 9x9 grid so that each row, column, and 3x3 box contains all digits from 1 to 9
                  without repetition.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Basic Controls</h3>
                <ul className="text-slate-300 space-y-2 list-disc list-inside">
                  <li>Click a cell to select it (bold numbers are given clues and cannot be changed)</li>
                  <li>Type a number 1-9 on your keyboard or use the number pad below the grid</li>
                  <li>Press Backspace/Delete to erase a cell</li>
                  <li>The timer starts automatically and tracks your solving time</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Features</h3>
                <ul className="text-slate-300 space-y-2 list-disc list-inside">
                  <li>
                    <strong>Highlighting:</strong> Selected cell&apos;s row, column, and 3x3 box are highlighted, plus matching values
                  </li>
                  <li>
                    <strong>Error Detection:</strong> Conflicting numbers are shown in red
                  </li>
                  <li>
                    <strong>Keyboard support:</strong> Arrow keys to navigate, 1-9 to enter, Backspace to erase
                  </li>
                  <li>
                    <strong>Personal Bests:</strong> Fastest solve time saved per difficulty
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Difficulty Levels</h3>
                <ul className="text-slate-300 space-y-2 list-disc list-inside">
                  <li>
                    <strong>Easy:</strong> 46 starting clues - great for beginners and quick games
                  </li>
                  <li>
                    <strong>Medium:</strong> 36 starting clues - requires basic Sudoku techniques
                  </li>
                  <li>
                    <strong>Hard:</strong> 26 starting clues - demands more solving strategies
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Solving Tips</h3>
                <ul className="text-slate-300 space-y-2 list-disc list-inside">
                  <li>Start by scanning rows, columns, and boxes for obvious placements</li>
                  <li>Look for &ldquo;naked singles&rdquo; (cells with only one possible value)</li>
                  <li>Eliminate candidates when you place a number in a row/column/box</li>
                  <li>Take your time - Sudoku rewards logical thinking over speed</li>
                </ul>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="mt-12 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">About Sudoku</h2>
            <div className="bg-slate-800 rounded-lg p-6 space-y-4 text-slate-300">
              <p>
                Sudoku is a logic-based number placement puzzle that became a global phenomenon in the 2000s.
                Despite its association with numbers, Sudoku is purely a logic puzzle - no math is required. The
                numbers could be replaced with letters or symbols without changing the puzzle.
              </p>
              <p>
                Each puzzle has a unique solution that can be reached through logical deduction. The modern Sudoku
                format was popularized in Japan in the 1980s (the name means "single number" in Japanese), though
                similar puzzles existed earlier in French newspapers.
              </p>
              <p>
                Our free online Sudoku offers three difficulty levels, each generated fresh on demand.
                Error highlighting, matching-number highlighting, and a running timer make it easy to
                work through puzzles and track your best time.
              </p>
              <p>
                Play Sudoku daily to improve your logical thinking, pattern recognition, and concentration. Track
                your progress with personal best times for each difficulty level!
              </p>
            </div>
          </section>

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
