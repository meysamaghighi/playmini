"use client";

import GameShell from "../components/GameShell";
import FroggerGame from "../components/FroggerGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Frogger free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function FroggerPlay() {
  return (
    <GameShell id="frogger" title="Frogger" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <FroggerGame />
      </div>
    </GameShell>
  );
}
