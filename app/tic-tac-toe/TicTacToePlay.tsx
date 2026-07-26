"use client";

import GameShell from "../components/GameShell";
import TicTacToe from "../components/TicTacToe";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Get three of your marks in a row — horizontally, vertically, or
      diagonally — before your opponent does.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click an empty square</li>
    </ul>
  </div>
);

export default function TicTacToePlay() {
  return (
    <GameShell id="tic-tac-toe" title="Tic-Tac-Toe" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <TicTacToe />
      </div>
    </GameShell>
  );
}
