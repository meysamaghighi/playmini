"use client";

import GameShell from "../components/GameShell";
import MemoryMatch from "../components/MemoryMatch";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Flip two cards at a time to find matching pairs. Clear the board in as
      few moves as possible.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click a card to flip it</li>
    </ul>
  </div>
);

export default function MemoryPlay() {
  return (
    <GameShell id="memory" title="Memory Match" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <MemoryMatch />
      </div>
    </GameShell>
  );
}
