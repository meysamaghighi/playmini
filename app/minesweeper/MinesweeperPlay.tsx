"use client";

import GameShell from "../components/GameShell";
import MinesweeperGame from "../components/MinesweeperGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Clear every safe square without detonating a mine. Numbers tell you how
      many mines are touching that square.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Left-click/tap to reveal a square</li>
      <li>Right-click, or long-press on mobile, to flag a suspected mine</li>
    </ul>
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
