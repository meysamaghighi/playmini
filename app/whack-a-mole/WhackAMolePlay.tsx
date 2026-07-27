"use client";

import GameShell from "../components/GameShell";
import WhackMole from "../components/WhackMole";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Moles pop up at random — whack as many as you can before the 30-second
      timer ends.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Tap or click a mole as it appears</li>
    </ul>
  </div>
);

export default function WhackAMolePlay() {
  return (
    <GameShell id="whack-a-mole" title="Whack-a-Mole" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <WhackMole />
      </div>
    </GameShell>
  );
}
