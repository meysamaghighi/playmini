import type { Metadata } from "next";
import MazeRunner from "../components/MazeRunner";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Maze Runner - Navigate Through Generated Mazes | PlayMini",
  description:
    "Free online maze game with procedurally generated mazes. Navigate from start to finish using arrow keys or swipe controls. Three difficulty levels with timer-based scoring!",
  keywords:
    "maze game, maze runner, maze puzzle, online maze, free maze game, puzzle game, brain game, labyrinth",
  alternates: {
    canonical: "/maze",
  },
  openGraph: {
    title: "Maze Runner - Navigate Through Generated Mazes | PlayMini",
    description:
      "Play free online maze game with procedurally generated mazes. Navigate to the goal as fast as you can!",
    type: "website",
    url: "https://playmini.fun/maze",
  },
};

export default function MazePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-3">Maze Runner</h1>
        <p className="text-gray-400">Navigate from start to finish through the maze</p>
      </div>

      <MazeRunner />

      {/* How to Play */}
      <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Desktop Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use Arrow Keys to move up, down, left, or right</li>
              <li>Alternative: W, A, S, D keys</li>
              <li>Navigate from the blue circle 🔵 to the green target 🎯</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Mobile Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Swipe in any direction to move</li>
              <li>Use on-screen arrow buttons</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Find the shortest path through the maze</li>
              <li>Complete it as fast as possible</li>
              <li>Minimize your move count</li>
              <li>Beat your personal best time!</li>
            </ul>
          </div>
        </div>
      </section>

      {/* About Maze Runner */}
      <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">About Maze Runner</h2>
        <div className="text-gray-300 space-y-3">
          <p>
            Maze Runner features procedurally generated mazes using a recursive backtracking algorithm. Each maze is unique and guaranteed to have a path from start to finish.
          </p>
          <p>
            The game offers three difficulty levels: Easy (11x11 grid), Medium (17x17 grid), and Hard (23x23 grid). Each new maze presents a fresh challenge with a different layout.
          </p>
          <p>
            Mazes are excellent brain training exercises that improve spatial awareness, planning skills, and problem-solving abilities. Try to find the optimal path and beat your best times!
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
                name: "How do I control the player in Maze Runner?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "On desktop, use the arrow keys or W/A/S/D keys to move. On mobile, you can swipe in any direction or use the on-screen arrow buttons. Navigate from the blue circle to the green target.",
                },
              },
              {
                "@type": "Question",
                name: "Are the mazes randomly generated?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes! Each maze is procedurally generated using a recursive backtracking algorithm. Every time you click 'New Maze', you get a unique puzzle to solve.",
                },
              },
              {
                "@type": "Question",
                name: "How does scoring work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Your score is based on completion time in seconds. The game also tracks the number of moves you make. Try to complete the maze as quickly as possible to beat your personal best!",
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
            name: "Maze Runner Game",
            description:
              "Free online maze game with procedurally generated mazes and multiple difficulty levels.",
            url: "https://playmini.fun/maze",
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
