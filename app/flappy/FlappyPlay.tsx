"use client";

import GameShell from "../components/GameShell";
import FlappyBird from "../components/FlappyBird";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Tap to flap and thread the gaps between pipes. One hit ends the run —
      beat your high score.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap/click, or press Space/Up Arrow, to flap</li>
    </ul>
  </div>
);

export default function FlappyPlay() {
  return (
    <GameShell id="flappy" title="Flappy Bird" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <FlappyBird />
      </div>
    </GameShell>
  );
}
