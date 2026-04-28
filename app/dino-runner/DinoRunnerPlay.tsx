"use client";

import GameShell from "../components/GameShell";
import DinoRunner from "../components/DinoRunner";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Dino Runner free in your browser — full guide in the section below.
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
