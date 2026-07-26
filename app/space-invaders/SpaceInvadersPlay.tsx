"use client";

import GameShell from "../components/GameShell";
import SpaceInvaders from "../components/SpaceInvaders";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Clear each wave of aliens before they reach the bottom. Grab power-ups
      for a shield, rapid fire, or a spread shot.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow keys or A/D to move (the ship fires automatically)</li>
      <li>On mobile, drag left/right to move</li>
    </ul>
  </div>
);

export default function SpaceInvadersPlay() {
  return (
    <GameShell id="space-invaders" title="Space Invaders" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SpaceInvaders />
      </div>
    </GameShell>
  );
}
