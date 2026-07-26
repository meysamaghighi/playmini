"use client";

import GameShell from "../components/GameShell";
import CrosswordGame from "../components/CrosswordGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Solve the clues and fill in the crossword grid. A new puzzle is
      generated every time you play.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a cell and type a letter; arrow keys move between cells</li>
      <li>Backspace/Delete clears a letter</li>
    </ul>
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
