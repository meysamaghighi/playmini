"use client";

import GameShell from "../components/GameShell";
import BubbleShooter from "../components/BubbleShooter";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Aim and shoot bubbles to match 3 or more of the same color and pop them.
      Clear the board before the bubbles reach the bottom.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Move your pointer/finger to aim, tap/click to shoot</li>
    </ul>
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
