"use client";

import GameShell from "../components/GameShell";
import SpaceInvaders from "../components/SpaceInvaders";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Space Invaders free in your browser — full guide in the section below.
    </p>
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
