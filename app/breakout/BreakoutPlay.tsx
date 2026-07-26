"use client";

import GameShell from "../components/GameShell";
import BreakoutGame from "../components/BreakoutGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Bounce the ball with your paddle to break every brick without letting
      the ball fall past you.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Move your mouse/finger, or use Arrow Left/Right or A/D, to steer the paddle</li>
    </ul>
  </div>
);

export default function BreakoutPlay() {
  return (
    <GameShell id="breakout" title="Breakout" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <BreakoutGame />
      </div>
    </GameShell>
  );
}
