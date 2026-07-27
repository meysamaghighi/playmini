"use client";

import GameShell from "../components/GameShell";
import Connect4Game from "../components/Connect4Game";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Drop pieces to connect four of your color in a row — horizontally,
      vertically, or diagonally — before your opponent does.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a column to drop a piece into it</li>
    </ul>
  </div>
);

export default function Connect4Play() {
  return (
    <GameShell id="connect4" title="Connect 4" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Connect4Game />
      </div>
    </GameShell>
  );
}
