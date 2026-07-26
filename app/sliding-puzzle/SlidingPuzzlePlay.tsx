"use client";

import GameShell from "../components/GameShell";
import SlidingPuzzle from "../components/SlidingPuzzle";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Slide numbered tiles into the empty space until they&apos;re arranged in
      order.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a tile next to the empty space to slide it, or use arrow keys</li>
    </ul>
  </div>
);

export default function SlidingPuzzlePlay() {
  return (
    <GameShell id="sliding-puzzle" title="Sliding Puzzle" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SlidingPuzzle />
      </div>
    </GameShell>
  );
}
