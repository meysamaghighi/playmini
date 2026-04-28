"use client";

import GameShell from "../components/GameShell";
import MinesweeperGame from "../components/MinesweeperGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Minesweeper free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function MinesweeperPlay() {
  return (
    <GameShell id="minesweeper" title="Minesweeper" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <MinesweeperGame />
      </div>
    </GameShell>
  );
}
