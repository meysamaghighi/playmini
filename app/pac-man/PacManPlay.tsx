"use client";

import GameShell from "../components/GameShell";
import PacManGame from "../components/PacManGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Pac-Man free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function PacManPlay() {
  return (
    <GameShell id="pac-man" title="Pac-Man" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <PacManGame />
      </div>
    </GameShell>
  );
}
