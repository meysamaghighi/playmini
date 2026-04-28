"use client";

import GameShell from "../components/GameShell";
import SimonSays from "../components/SimonSays";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Simon Says free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function SimonPlay() {
  return (
    <GameShell id="simon" title="Simon Says" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SimonSays />
      </div>
    </GameShell>
  );
}
