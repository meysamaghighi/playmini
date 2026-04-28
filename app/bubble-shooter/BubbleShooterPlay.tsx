"use client";

import GameShell from "../components/GameShell";
import BubbleShooter from "../components/BubbleShooter";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Bubble Shooter free in your browser — full guide in the section below.
    </p>
  </div>
);

export default function BubbleShooterPlay() {
  return (
    <GameShell id="bubble-shooter" title="Bubble Shooter" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <BubbleShooter />
      </div>
    </GameShell>
  );
}
