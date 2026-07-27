"use client";

import GameShell from "../components/GameShell";
import Pong from "../components/Pong";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Classic paddle battle against the computer — first to 7 points wins.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow Up/Down or W/S to move your paddle</li>
    </ul>
  </div>
);

export default function PongPlay() {
  return (
    <GameShell id="pong" title="Pong" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Pong />
      </div>
    </GameShell>
  );
}
