"use client";

import GameShell from "../components/GameShell";
import CarRacer from "../components/CarRacer";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Dodge oncoming traffic across three lanes — see how far you can get
      before you crash.
    </p>
    <p className="mb-1 font-semibold text-ink">Controls</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Arrow Left/Right or A/D to change lanes</li>
      <li>On mobile, swipe left/right</li>
    </ul>
  </div>
);

export default function CarRacerPlay() {
  return (
    <GameShell id="car-racer" title="Car Racer" howTo={HOW_TO} status="idle">
      <div className="py-4">
        <CarRacer />
      </div>
    </GameShell>
  );
}
