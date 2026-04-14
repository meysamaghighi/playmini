import type { Metadata } from "next";
import AsteroidsGame from "../components/AsteroidsGame";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Asteroids Online Free - Classic Arcade Browser Game | PlayMini",
  description:
    "Play Asteroids online free! Shoot asteroids, dodge debris, survive wave after wave. Classic arcade shooter in your browser — no download, no sign-up.",
  keywords: [
    "asteroids online",
    "play asteroids free",
    "asteroids browser game",
    "asteroids unblocked",
    "classic asteroids game",
    "asteroids no download",
    "space shooter browser",
    "retro arcade game online",
    "asteroids arcade",
    "asteroid shooter game",
  ],
  alternates: { canonical: "/asteroids" },
  openGraph: {
    title: "Play Asteroids Online Free | PlayMini",
    description: "Classic Asteroids in your browser — rotate, thrust, shoot. No download needed.",
    type: "website",
    url: "https://playmini.fun/asteroids",
  },
};

export default function AsteroidsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Asteroids
          </h1>
          <p className="text-gray-300 text-lg">
            Destroy all asteroids to advance — but watch out, they split into smaller, faster pieces!
          </p>
        </div>

        <AsteroidsGame />

        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">How to Play</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Left / Right arrows (or A/D) — rotate ship</li>
                <li>Up arrow (or W) — thrust forward</li>
                <li>Space or X — fire</li>
                <li>Mobile: use the on-screen buttons</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Scoring</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Large asteroid — 20 pts</li>
                <li>Medium asteroid — 50 pts</li>
                <li>Small asteroid — 100 pts</li>
                <li>Clear all asteroids to advance to the next level</li>
              </ul>
            </div>
          </div>
        </section>

        <MoreGames />
      </div>
    </main>
  );
}
