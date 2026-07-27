"use client";

import GameShell from "../components/GameShell";
import SudokuGame from "../components/SudokuGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Fill the 9x9 grid so every row, column, and 3x3 box contains the digits
      1-9 with no repeats.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Click a cell, then press 1-9 (or tap the number pad) to fill it</li>
      <li>Backspace/Delete or 0 clears a cell; arrow keys move the selection</li>
    </ul>
  </div>
);

export default function SudokuPlay() {
  return (
    <GameShell id="sudoku" title="Sudoku" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SudokuGame />
      </div>
    </GameShell>
  );
}
