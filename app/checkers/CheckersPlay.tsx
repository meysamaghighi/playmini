"use client";

import GameShell from "../components/GameShell";
import CheckersGame from "../components/CheckersGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Capture all of the AI&apos;s pieces, or block every legal move it has
      left. Kings and mandatory captures apply.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a piece, then tap/click a highlighted square to move it</li>
    </ul>
  </div>
);

export default function CheckersPlay() {
  return (
    <GameShell id="checkers" title="Checkers" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <CheckersGame />
      </div>
    </GameShell>
  );
}
