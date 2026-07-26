"use client";

import GameShell from "../components/GameShell";
import PacManGame from "../components/PacManGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Eat every dot in the maze while dodging the ghosts. Grab a power pellet
      to turn the tables and eat them instead.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys to move</li>
      <li>On mobile, swipe in the direction you want to go</li>
    </ul>
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
