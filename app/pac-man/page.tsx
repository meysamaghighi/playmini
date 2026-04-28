import type { Metadata } from "next";
import PacManGame from "../components/PacManGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Pac-Man Online Free - Browser Pac-Man | PlayMini",
  description:
    "Play Pac-Man online free! Classic maze game in your browser — eat dots, dodge ghosts, grab power pellets. No download, no sign-up. Desktop and mobile.",
  keywords: [
    "pac-man online",
    "play pac-man free",
    "pac man browser game",
    "pac-man no download",
    "pac man classic game",
    "pac-man unblocked",
    "free pac-man online",
    "arcade game browser",
    "pac man maze game",
    "pac-man mobile",
  ],
  alternates: { canonical: "/pac-man" },
  openGraph: {
    title: "Play Pac-Man Online Free | PlayMini",
    description: "Classic Pac-Man in your browser. Eat dots, dodge ghosts, grab power pellets.",
    type: "website",
    url: "https://playmini.fun/pac-man",
  },
};

export default function PacManPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Pac-Man
          </h1>
          <p className="text-ink-2 text-lg">
            Eat all the dots, avoid the ghosts, and grab power pellets to turn the tables!
          </p>
        </div>

        <PacManGame />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Arrow keys or WASD to move</li>
                <li>Swipe in any direction on mobile</li>
                <li>Space or tap to start / restart</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Eat all yellow dots to clear the level</li>
                <li>Avoid the 4 coloured ghosts — one hit costs a life</li>
                <li>Eat a flashing power pellet to frighten ghosts</li>
                <li>Eat frightened ghosts for 200, 400, 800, 1600 points</li>
                <li>3 lives total — game over when all are gone</li>
              </ul>
            </div>
          </div>
        </section>

        <MoreGames />
      </div>
    </main>
  );
}
