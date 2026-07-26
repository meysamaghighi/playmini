"use client";

import GameShell from "../components/GameShell";
import ChessGame from "../components/ChessGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Full chess rules against the computer, including castling, en passant,
      and promotion.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a piece, then tap/click the square to move it to</li>
    </ul>
  </div>
);

export default function ChessPlay() {
  return (
    <GameShell id="chess" title="Chess" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <ChessGame />
      </div>
    </GameShell>
  );
}
