import type { Metadata } from "next";
import MazePlay from "./MazePlay";

export const metadata: Metadata = {
  title: "Play Maze Runner Online Free - Puzzle Game | PlayMini",
  description:
    "Play Maze Runner online free! Navigate through procedurally generated mazes, 3 difficulty levels. Use arrows or swipe. Browser-based puzzle game, no download.",
  keywords:
    "maze game, maze runner, maze puzzle, online maze, free maze game, puzzle game, brain game, labyrinth",
  alternates: {
    canonical: "/maze",
  },
  openGraph: {
    title: "Play Maze Runner Online Free - Puzzle Game | PlayMini",
    description:
      "Play Maze Runner online free! Navigate through procedurally generated mazes, 3 difficulty levels. Use arrows or swipe. Browser-based puzzle game, no download.",
    type: "website",
    url: "https://playmini.fun/maze",
  },
};

export default function MazePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">Navigate from start to finish through the maze</p>
      </div>
        <MazePlay />

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
    </main>
  );
}
