import type { Metadata } from "next";
import FroggerPlay from "./FroggerPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Frogger Online Free - Classic Frogger Browser Game | PlayMini",
  description:
    "Play Frogger online free! Hop across busy roads and rivers to reach home. Classic arcade game in your browser — no download, no sign-up. Desktop and mobile.",
  keywords: [
    "frogger online",
    "play frogger free",
    "frogger browser game",
    "frogger unblocked",
    "classic frogger game",
    "frogger no download",
    "arcade frogger online",
    "frog crossing game",
    "frogger mobile",
  ],
  alternates: { canonical: "/frogger" },
  openGraph: {
    title: "Play Frogger Online Free | PlayMini",
    description: "Hop across traffic and rivers to reach home. Classic Frogger in your browser.",
    type: "website",
    url: "https://playmini.fun/frogger",
  },
};

export default function FroggerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Guide your frog across busy roads and treacherous rivers — reach all 5 home slots to win!
          </p>
        </div>
        <FroggerPlay />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-green-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Controls</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Arrow keys or WASD to hop in any direction</li>
                <li>Swipe on mobile — tap to hop forward</li>
                <li>Space or tap to start / restart</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Rules</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Cross the road without getting hit by cars or trucks</li>
                <li>Cross the river by jumping on logs and turtles — falling in is fatal</li>
                <li>Fill all 5 home slots at the top to clear the level</li>
                <li>You have 30 seconds per frog — bonus points for speed</li>
                <li>3 lives total — each level gets faster</li>
              </ul>
            </div>
          </div>
        </section>

        <MoreGames />
      </div>
    </main>
  );
}
