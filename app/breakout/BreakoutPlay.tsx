"use client";

import GameShell from "../components/GameShell";
import BreakoutGame from "../components/BreakoutGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Breakout free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function BreakoutPlay() {
  return (
    <GameShell id="breakout" title="Breakout" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <BreakoutGame />
      </div>
    </GameShell>
  );
}
