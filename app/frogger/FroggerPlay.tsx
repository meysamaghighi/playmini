"use client";

import GameShell from "../components/GameShell";
import FroggerGame from "../components/FroggerGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Hop your frog across busy roads and a river full of logs to reach home
      safely.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys to hop</li>
      <li>On mobile, swipe in the direction you want to hop</li>
    </ul>
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
