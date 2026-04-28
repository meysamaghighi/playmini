"use client";

import GameShell from "../components/GameShell";
import TicTacToe from "../components/TicTacToe";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Tic-Tac-Toe free in your browser — full guide in the section below.
    </p>
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
