"use client";

import GameShell from "../components/GameShell";
import SlidingPuzzle from "../components/SlidingPuzzle";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Sliding Puzzle free in your browser — full guide in the section below.
    </p>
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
