"use client";

import GameShell from "../components/GameShell";
import MemoryMatch from "../components/MemoryMatch";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Memory Match free in your browser — full guide in the section below.
    </p>
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
