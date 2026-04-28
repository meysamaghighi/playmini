"use client";

import GameShell from "../components/GameShell";
import SudokuGame from "../components/SudokuGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Sudoku free in your browser — full guide in the section below.
    </p>
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
