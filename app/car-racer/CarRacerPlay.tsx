"use client";

import GameShell from "../components/GameShell";
import CarRacer from "../components/CarRacer";

const HOW_TO = (
  <div>
    <p className="mb-3">
      Play Car Racer free in your browser — full guide in the section below.
    </p>
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
