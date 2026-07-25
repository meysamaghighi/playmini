"use client";

import GameShell from "../components/GameShell";
import DinoRunner from "../components/DinoRunner";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Jump over cacti, duck under pterodactyls. Tap or Space to jump; swipe down
      or ↓ to duck.
    </p>
  </div>
);

export default function DinoRunnerPlay() {
  return (
    <GameShell id="dino-runner" title="Dino Runner" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <DinoRunner />
      </div>
    </GameShell>
  );
}
