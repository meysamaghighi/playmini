"use client";

import GameShell from "../components/GameShell";
import AsteroidsGame from "../components/AsteroidsGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Pilot your ship through drifting asteroids, blasting them apart while
      dodging debris wave after wave.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys or WASD to move and rotate, Space to fire</li>
    </ul>
  </div>
);

export default function AsteroidsPlay() {
  return (
    <GameShell id="asteroids" title="Asteroids" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <AsteroidsGame />
      </div>
    </GameShell>
  );
}
