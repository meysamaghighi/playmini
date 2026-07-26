"use client";

import GameShell from "../components/GameShell";
import SoccerGame from "../components/SoccerGame";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Take 10 penalty kicks and beat the goalkeeper as many times as you can.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Drag the Aim and Power sliders, then tap Shoot!</li>
    </ul>
  </div>
);

export default function SoccerPlay() {
  return (
    <GameShell id="soccer" title="Penalty Kicks" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <SoccerGame />
      </div>
    </GameShell>
  );
}
