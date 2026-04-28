"use client";

import GameShell from "../components/GameShell";
import AsteroidsGame from "../components/AsteroidsGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Asteroids free in your browser — full guide in the section below.
    </p>
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
