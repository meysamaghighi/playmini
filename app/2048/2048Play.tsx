"use client";

import GameShell from "../components/GameShell";
import Game2048 from "../components/Game2048";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Slide numbered tiles to combine matching pairs. Reach the 2048 tile to
      win — keep going after that for a higher score.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys or WASD to slide tiles</li>
      <li>On mobile, swipe in any direction</li>
    </ul>
  </div>
);

export default function Game2048Play() {
  return (
    <GameShell id="2048" title="2048 Game" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <Game2048 />
      </div>
    </GameShell>
  );
}
