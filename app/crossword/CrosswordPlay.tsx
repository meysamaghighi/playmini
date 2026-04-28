"use client";

import GameShell from "../components/GameShell";
import CrosswordGame from "../components/CrosswordGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Crossword Puzzle free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function CrosswordPlay() {
  return (
    <GameShell id="crossword" title="Crossword Puzzle" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <CrosswordGame />
      </div>
    </GameShell>
  );
}
