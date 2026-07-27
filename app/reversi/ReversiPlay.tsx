"use client";

import GameShell from "../components/GameShell";
import ReversiGame from "../components/ReversiGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Flank your opponent&apos;s pieces to flip them to your color. Whoever
      controls the most pieces when the board fills up wins.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a highlighted square to place a piece there</li>
    </ul>
  </div>
);

export default function ReversiPlay() {
  return (
    <GameShell id="reversi" title="Reversi" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <ReversiGame />
      </div>
    </GameShell>
  );
}
